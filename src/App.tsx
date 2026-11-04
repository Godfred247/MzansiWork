import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DemoProvider } from './contexts/DemoStore';
import { SiteFrame } from './marketing/layout/SiteFrame';
import { Home } from './marketing/pages/Home';
import { AboutPage, ArticlePage, BlogPage, ContactPage, EntryPage, FaqPage, GuidesPage, HelpPage, LegalPage, NotFoundPage, ResourcesPage, TourPage } from './marketing/pages/InfoPages';
import { PricingPage } from './marketing/pages/PricingPage';
import { CatalogPage, StoryPage } from './marketing/pages/StoryPage';
import { stories } from './marketing/content';
import { DemoCanvas } from './pages/DemoCanvas';

function Application() {
  useEffect(() => {
    document.title = 'MzansiWork application';
  }, []);
  return (
    <DemoProvider>
      <DemoCanvas />
    </DemoProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<Application />} />
        <Route element={<SiteFrame />}>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<CatalogPage kind="product" />} />
          <Route path="/solutions" element={<CatalogPage kind="solutions" />} />
          <Route path="/industries" element={<CatalogPage kind="industries" />} />
          {stories.map((story) => <Route key={story.path} path={story.path} element={<StoryPage />} />)}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/blog" element={<BlogPage />} />
          <Route path="/resources/blog/:slug" element={<ArticlePage />} />
          <Route path="/resources/guides" element={<GuidesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage doc="privacy" />} />
          <Route path="/terms" element={<LegalPage doc="terms" />} />
          <Route path="/cookies" element={<LegalPage doc="cookies" />} />
          <Route path="/subscription-terms" element={<LegalPage doc="subscription" />} />
          <Route path="/tracking-policy" element={<LegalPage doc="tracking" />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="/login" element={<EntryPage mode="login" />} />
          <Route path="/get-started" element={<EntryPage mode="start" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
