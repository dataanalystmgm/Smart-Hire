import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="space-y-24 pb-12">
      {/* HEADER */}
      <section className="relative overflow-hidden bg-mgm-dark text-white p-8 md:p-16 flex flex-col items-center gap-6 text-center pb-24 -mx-4 sm:-mx-8 lg:-mx-12 -mt-10 mb-12">
        <div className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/103-U5wBI_j0OdFv9oHwKboOPmZgiv2MW')" }}></div>
        <div className="relative z-10 max-w-4xl pt-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold font-google uppercase tracking-tighter mb-6"
          >
            Tentang Kami
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 font-light"
          >
            PT. Mercindo Global Manufaktur
          </motion.p>
        </div>
      </section>

      {/* VISION SECTION */}
      <section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-slate-900 flex items-center min-h-[400px] ">
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1a2HLhlQA7bpuXTctN3iwncSCsqnVjOK3')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-mgm-dark/90 to-transparent z-0"></div>
          
          <div className="relative z-10 p-10 md:p-16 w-full md:w-3/4">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-bold text-mgm-green uppercase tracking-wider mb-4">Our Vision</h4>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight font-google mb-6">
                To be the Best Sport Glove Manufacturer with Blessing for All People Involved
              </h2>
              <p className="text-lg text-white/70 italic font-medium">
                Menjadi Perusahaan Sarung Tangan Olahraga Terbaik dengan Berkat bagi Semua Pihak yang Terlibat.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-teal-950 flex items-center justify-end min-h-[400px] ">
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1kgcXTFf7P3CyiBoD_qw3CED2NlR1bsEK')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-l from-mgm-dark/90 to-transparent z-0"></div>
          
          <div className="relative z-10 p-10 md:p-16 w-full md:w-3/4 text-right">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-bold text-mgm-green uppercase tracking-wider mb-4">Our Mission</h4>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight font-google mb-6">
                To Provide Best Products Experiences for the User through Commitment on the Value
              </h2>
              <p className="text-lg text-white/70 italic font-medium">
                Menyediakan Pengalaman Produk Terbaik bagi Pengguna melalui Komitmen terhadap Nilai
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORPORATE VALUES */}
      <section className="relative w-full -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden bg-slate-800 flex flex-col md:flex-row items-stretch min-h-[400px] ">
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1JQTKIkNIa_WEs3_8OJJg9ell3gv_a-FT')" }}></div>
          
          <div className="relative z-10 p-10 md:p-16 w-full md:w-1/2 flex flex-col justify-center bg-mgm-dark/80 backdrop-blur-sm border-r border-white/10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-sm font-bold text-mgm-green uppercase tracking-wider mb-4">Corporate Values</h4>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight font-google">
                Business Philosophy of MGM
              </h2>
            </motion.div>
          </div>

          <div className="relative z-10 p-10 md:p-16 w-full md:w-1/2 flex flex-col justify-center bg-black/40 backdrop-blur-sm">
            <motion.ul 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                { num: "1", text: "Quality" },
                { num: "2", text: "Innovation" },
                { num: "3", text: "Teamwork" },
                { num: "4", text: "Customer Satisfaction" }
              ].map((val, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-6 group"
                >
                  <span className="text-5xl font-extrabold text-mgm-green/50 font-google group-hover:text-mgm-green transition-colors">{val.num}.</span>
                  <span className="text-3xl font-bold text-white tracking-wide font-google group-hover:translate-x-2 transition-transform">{val.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>
    </div>
  );
}
