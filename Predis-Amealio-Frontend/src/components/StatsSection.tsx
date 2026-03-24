const stats = [
  {
    value: "70%",
    label: "Reduction in Hours Spent",
    description: "Save time with AI automation"
  },
  {
    value: "500K+",
    label: "Users Across Countries",
    description: "Trusted by businesses worldwide"
  },
  {
    value: "4.9/5",
    label: "Rating from 5000+ Reviews",
    description: "Exceptional user satisfaction"
  }
];

const StatsSection = () => {
  return (
    <section className="py-10 bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="mb-4">
                <span className="text-5xl md:text-6xl font-bold" style={{ color: '#001D51' }}>
                  {stat.value}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#001D51' }}>
                {stat.label}
              </h3>
              <p className="text-sm" style={{ color: '#001D51' }}>
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;