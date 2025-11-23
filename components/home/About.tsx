"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 lg:px-20 py-20 bg-white overflow-hidden"
    >
      {/* Curved Wave Top Divider */}
      <div className="absolute -top-[1px] left-0 w-full overflow-hidden leading-none rotate-180 z-10">
        <svg
          className="relative block w-full h-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#000000"
            d="M0,192L60,170.7C120,149,240,107,360,117.3C480,128,600,192,720,213.3C840,235,960,213,1080,192C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>

      {/* Background Accent Shapes */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="max-w-5xl text-center relative z-20">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About <span className="text-orange-500">CodersZonee</span>
        </motion.h2>

        <motion.p
          className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          At <span className="text-orange-500 font-semibold">CodersZonee</span>, we bridge the gap between{" "}
          <span className="font-semibold text-gray-900">learning</span> and{" "}
          <span className="font-semibold text-gray-900">employment</span>.  
          Our programs give you hands-on experience with{" "}
          <span className="text-orange-500">real-world projects</span>, guided by industry leaders, so you become
          career-ready.
        </motion.p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Industry Mentorship",
              desc: "Learn directly from experienced professionals who have shaped tech, marketing, and data industries.",
            },
            {
              title: "Hands-On Projects",
              desc: "Work on real-world case studies, simulations, and projects that make your resume stand out.",
            },
            {
              title: "Career Growth",
              desc: "Not just learning, but also preparing you for interviews, networking, and real job opportunities.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-orange-400 transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-3 text-orange-500">{item.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
