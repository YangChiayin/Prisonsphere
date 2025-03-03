import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";

// Validation Schema
const inmateSchema = yup.object().shape({
  firstName: yup.string().required("⚠ First Name is required."),
  lastName: yup.string().required("⚠ Last Name is required."),
  dateOfBirth: yup
    .date()
    .typeError("⚠ Please select a valid date of birth.")
    .required("⚠ Date of Birth is required."),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"], "⚠ Please select a valid gender.")
    .required("⚠ Gender is required."),
  admissionDate: yup
    .date()
    .typeError("⚠ Please select a valid admission date.")
    .required("⚠ Admission Date is required."),
  sentenceDuration: yup
    .number()
    .typeError("⚠ Sentence Duration must be a number.")
    .positive("⚠ Sentence Duration must be greater than zero.")
    .integer("⚠ Sentence Duration must be a whole number.")
    .required("⚠ Sentence Duration (months) is required."),
  crimeDetails: yup.string().required("⚠ Crime Details are required."),
  assignedCell: yup.string().required("⚠ Assigned Cell is required."),
  status: yup.string().oneOf(["Incarcerated", "Released"]),
  profileImage: yup.mixed().nullable(),
});

const InmateForm = ({ nextInmateID, onClose, inmateData, onFormSuccess }) => {
  const isEditMode = !!inmateData; // Detect if editing

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(inmateSchema),
    defaultValues: inmateData || { status: "Incarcerated" },
  });

  const [selectedImage, setSelectedImage] = useState(null);

  // Load inmate data for editing
  useEffect(() => {
    if (isEditMode && inmateData) {
      Object.keys(inmateData).forEach((key) => {
        if (key === "dateOfBirth" || key === "admissionDate") {
          // Convert date to YYYY-MM-DD format for form inputs
          setValue(
            key,
            inmateData[key]
              ? new Date(inmateData[key]).toISOString().split("T")[0]
              : ""
          );
        } else {
          setValue(key, inmateData[key]);
        }
      });

      if (inmateData.profileImage) {
        setSelectedImage(inmateData.profileImage);
      }
    }
  }, [isEditMode, inmateData, setValue]);

  // Handle Image Selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setValue("profileImage", file);
    }
  };

  // Form Submission
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "dateOfBirth" || key === "admissionDate") {
          // Convert date back to ISO format for the backend
          formData.append(
            key,
            data[key] ? new Date(data[key]).toISOString() : ""
          );
        } else if (key === "profileImage" && data[key] instanceof File) {
          formData.append(key, data[key]); // Append file separately
        } else if (key === "behaviorReports") {
          // behaviorReports: Send only valid ObjectIds
          const validReports = (data[key] || []).filter(
            (report) => report.length === 24 // Ensure only valid ObjectIds are sent
          );
          formData.append(key, JSON.stringify(validReports));
        } else {
          formData.append(key, data[key]);
        }
      });

      let response;

      if (isEditMode) {
        response = await axios.put(
          `http://localhost:5000/prisonsphere/inmates/${inmateData._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // New Inmate Registration
        response = await axios.post(
          "http://localhost:5000/prisonsphere/inmates",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isEditMode
            ? "Inmate Updated Successfully!"
            : `Inmate Registered Successfully! ID: ${response.data.inmate.inmateID}`,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            onClose: () => {
              onClose();
              onFormSuccess(); //Refresh the UI immediately
            },
          }
        );
      }
    } catch (error) {
      console.error("❌ Error processing inmate update:", error);
      toast.error(
        "⚠ Failed to process inmate. Check the console for details.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-20 backdrop-blur-[10px]"
    >
      <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-lg relative max-h-screen overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {isEditMode ? "Edit Inmate" : "Add New Inmate"}
        </h2>

        {/* Toast Container for Notifications */}
        <ToastContainer />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <label className="block">Inmate ID</label>
              <input
                type="text"
                value={inmateData ? inmateData.inmateID : nextInmateID}
                readOnly
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block">First Name</label>
              <input
                {...register("firstName")}
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-red-500 text-sm">
                {errors.firstName?.message}
              </p>
            </div>

            <div>
              <label className="block">Last Name</label>
              <input
                {...register("lastName")}
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-red-500 text-sm">{errors.lastName?.message}</p>
            </div>

            <div>
              <label className="block">Date of Birth</label>
              <input
                type="date"
                {...register("dateOfBirth", {
                  setValueAs: (v) => (v === "" ? null : v), // Prevents empty string errors
                })}
                className="w-full p-3 border rounded-lg"
              />

              <p className="text-red-500 text-sm">
                {errors.dateOfBirth?.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block">Gender</label>
              <select
                {...register("gender")}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-red-500 text-sm">{errors.gender?.message}</p>
            </div>

            <div>
              <label className="block">Admission Date</label>
              <input
                type="date"
                {...register("admissionDate")}
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-red-500 text-sm">
                {errors.admissionDate?.message}
              </p>
            </div>

            <div>
              <label className="block">Sentence Duration (Months)</label>
              <input
                type="number"
                {...register("sentenceDuration")}
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-red-500 text-sm">
                {errors.sentenceDuration?.message}
              </p>
            </div>

            <div>
              <label className="block">Status</label>
              <select
                {...register("status")}
                disabled={!isEditMode}
                className="w-full p-3 border rounded-lg"
              >
                <option value="Incarcerated">Incarcerated</option>
                <option value="Released">Released</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block">Crime Details</label>
            <textarea
              {...register("crimeDetails")}
              className="w-full p-3 border rounded-lg"
              placeholder="Homicide, Theft, etc..."
            ></textarea>
            <p className="text-red-500 text-sm">
              {errors.crimeDetails?.message}
            </p>
          </div>

          <div>
            <label className="block">Assigned Cell</label>
            <input
              {...register("assignedCell")}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter assigned cell (e.g., Block A-12)"
            />
            <p className="text-red-500 text-sm">
              {errors.assignedCell?.message}
            </p>
          </div>

          {/*Profile Image Upload */}
          <div>
            <label className="block">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg"
            />
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Profile Preview"
                className="mt-2 w-24 h-24 object-cover rounded-lg border"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {isEditMode ? "Update Inmate" : "Register Inmate"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default InmateForm;
