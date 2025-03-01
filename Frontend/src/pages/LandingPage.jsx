import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineAccountBalance } from "react-icons/md"; // Inmate Mgmt
import { AiOutlineUsergroupAdd } from "react-icons/ai"; // Visitor Logs
import { FaGavel, FaRegHandshake } from "react-icons/fa"; // Parole & Rehab
import { FiFileText } from "react-icons/fi"; // Reports
import pageImg from "../assets/images/landingPageImg.png";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  return (
    <>
      {/* Page Wrapper */}
      <div className="relative flex flex-col h-screen items-center overflow-hidden bg-gradient-to-r from-white via-blue-100 to-blue-300">
        {/* Navbar */}
        <Navbar showBackLink={false} showLoginLink={true} />

        {/* Main Content */}
        <div className="relative mt-20 h-4/5 flex w-[90%] items-center justify-center md:w-[80%]">
          {/* Left Section - Text & CTA */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full text-center md:w-1/2 md:text-left"
          >
            <h1 className="leading-tight font-bold text-blue-800 text-3xl sm:text-4xl md:text-5xl">
              Manage & Rehabilitate Inmates Efficiently
            </h1>
            <p className="pt-4 text-gray-900 text-base sm:text-lg lg:text-xl">
              PrisonSphere is an advanced digital system for inmate profiling,
              tracking rehabilitation progress, managing visits, and generating
              intelligent reports for effective correctional facility
              management.
            </p>

            <div className="pt-5 pb-10 flex w-full justify-center md:justify-start">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-center text-sm font-medium text-white shadow-md hover:bg-blue-700 transition"
                >
                  Login
                </motion.button>
              </Link>
            </div>

            {/* Module Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }} // Delays after left & right sections
              className="moduleSection w-full sm:w-auto flex flex-col justify-center items-center sm:items-start "
            >
              <p className="font-bold text-lg sm:text-xl text-gray-700">
                The Prisonsphere Modules
              </p>
              <div className="pt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { Icon: MdOutlineAccountBalance, label: "Inmate Mgmt" },
                  { Icon: AiOutlineUsergroupAdd, label: "Visitor Logs" },
                  { Icon: FaGavel, label: "Parole Mgmt" },
                  { Icon: FaRegHandshake, label: "Rehab & Work" },
                  { Icon: FiFileText, label: "Reports" },
                ].map(({ Icon, label }, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center transition duration-200"
                  >
                    <Icon className="text-blue-700 text-2xl sm:text-3xl" />
                    <span className="mt-2 text-base  text-gray-900">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Section - Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0 hidden md:flex"
          >
            <img src={pageImg} alt="PrisonSphere Overview" className="" />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
