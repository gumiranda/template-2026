import {
  Header,
  Hero,
  Statistics,
  HowItWorks,
  Features,
  Testimonials,
  Pricing,
  FinalCTA,
  Footer,
} from "../components/landing";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Statistics />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
