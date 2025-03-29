import { Button } from '@/components/ui/button';
import { ArrowRight, Wand2, Share2, Brain } from 'lucide-react';
import { VisualizationPreview } from './visualization-preview';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Transform Text into
                <span className="block text-orange-500">Beautiful Visuals</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Create stunning visualizations from your text using AI. Perfect for mind maps, flowcharts, and more. No design skills needed.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                  <a href="/sign-up">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <VisualizationPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Wand2 className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  AI-Powered Visualization
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Transform your text into beautiful visualizations using advanced AI technology.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Smart Layout
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Automatic layout optimization for clear and organized visualizations.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Share2 className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Easy Sharing
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Share your visualizations with team members or export them for presentations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to visualize your ideas?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Join thousands of users who are already transforming their text into beautiful visualizations. Start creating your first visualization in minutes.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                <a href="/sign-up">
                  Start Creating
                  <ArrowRight className="ml-3 h-6 w-6" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
