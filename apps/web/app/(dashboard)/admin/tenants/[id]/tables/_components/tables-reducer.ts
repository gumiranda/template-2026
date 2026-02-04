export type FormatTemplate = "tent-card-4x6" | "sticker-2x2";
export type ColorTheme = "light" | "dark";
export type StatusFilter = "all" | "active" | "inactive";
export type SortBy = "number" | "created" | "status";
export type SortOrder = "asc" | "desc";

export interface BatchSettings {
  formatTemplate: FormatTemplate;
  colorTheme: ColorTheme;
  callToAction: string;
  showTableNumber: boolean;
}

export interface PageState {
  searchQuery: string;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedTableIds: Set<string>;
  generateForm: { startId: string; endId: string };
  batchSettings: BatchSettings;
  isGenerating: boolean;
  deleteConfirmTableId: string | null;
  statsTableId: string | null;
}

export type PageAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: StatusFilter }
  | { type: "SET_SORT_BY"; payload: SortBy }
  | { type: "SET_SORT_ORDER"; payload: SortOrder }
  | { type: "TOGGLE_SORT_ORDER" }
  | { type: "TOGGLE_TABLE_SELECTION"; payload: string }
  | { type: "SELECT_ALL_TABLES"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_GENERATE_FORM"; payload: { startId?: string; endId?: string } }
  | { type: "SET_BATCH_SETTING"; payload: Partial<BatchSettings> }
  | { type: "SET_IS_GENERATING"; payload: boolean }
  | { type: "SET_DELETE_CONFIRM_TABLE_ID"; payload: string | null }
  | { type: "SET_STATS_TABLE_ID"; payload: string | null };

const initialBatchSettings: BatchSettings = {
  formatTemplate: "tent-card-4x6",
  colorTheme: "light",
  callToAction: "SCAN TO ORDER",
  showTableNumber: true,
};

export const initialState: PageState = {
  searchQuery: "",
  statusFilter: "all",
  sortBy: "number",
  sortOrder: "asc",
  selectedTableIds: new Set(),
  generateForm: { startId: "", endId: "" },
  batchSettings: initialBatchSettings,
  isGenerating: false,
  deleteConfirmTableId: null,
  statsTableId: null,
};

export function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload };
    case "TOGGLE_SORT_ORDER":
      return { ...state, sortOrder: state.sortOrder === "asc" ? "desc" : "asc" };
    case "TOGGLE_TABLE_SELECTION": {
      const newSet = new Set(state.selectedTableIds);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      return { ...state, selectedTableIds: newSet };
    }
    case "SELECT_ALL_TABLES":
      return { ...state, selectedTableIds: new Set(action.payload) };
    case "CLEAR_SELECTION":
      return { ...state, selectedTableIds: new Set() };
    case "SET_GENERATE_FORM":
      return {
        ...state,
        generateForm: { ...state.generateForm, ...action.payload },
      };
    case "SET_BATCH_SETTING":
      return {
        ...state,
        batchSettings: { ...state.batchSettings, ...action.payload },
      };
    case "SET_IS_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_DELETE_CONFIRM_TABLE_ID":
      return { ...state, deleteConfirmTableId: action.payload };
    case "SET_STATS_TABLE_ID":
      return { ...state, statsTableId: action.payload };
    default:
      return state;
  }
}
