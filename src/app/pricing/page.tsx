import Pricing from '@/components/home/Pricing';

export default function PricingPage() {
  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Planes y Precios</h1>
        <Pricing />
      </div>
    </div>
  );
}