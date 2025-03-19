/**
 * @file VisitorForm.js
 * @description Form for logging and editing visitor records in the PrisonSphere system.
 * @module components/VisitorForm
 *
 * This component:
 * - Logs new visitor entries or edits existing ones.
 * - Ensures proper validation before submitting visitor data.
 * - Provides a responsive and user-friendly UI.
 *
 * Features:
 * - Uses `react-hook-form` and `yup` for validation.
 * - Handles both visitor registration and editing in a single form.
 * - Uses Framer Motion for smooth animations.
 * - Displays success and error notifications using `react-toastify`.
 *
 * @requires react - React library for building UI components.
 * @requires axios - Library for making HTTP requests.
 * @requires react-hook-form - Manages form validation and submission.
 * @requires @hookform/resolvers/yup - Resolves validation rules with Yup.
 * @requires yup - Schema validation library for form input.
 * @requires framer-motion - Animation library for smooth UI effects.
 * @requires react-toastify - Displays toast notifications.
 */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Validation Schema for Visitor Form
 * - Ensures valid input before submission.
 */
const visitorSchema = yup.object().shape({
  visitorName: yup.string().required("⚠ Visitor Name is required."),
  relationshipToInmate: yup.string().required("⚠ Relationship is required."),
  contactNumber: yup
    .string()
    .matches(/^\d{10,15}$/, "⚠ Enter a valid contact number.")
    .required("⚠ Contact number is required."),
  email: yup
    .string()
    .email("⚠ Enter a valid email.")
    .required("⚠ Email is required."),

  visitTimestamp: yup
    .date()
    .typeError("⚠ Please select a valid visit date & time.") // Catches invalid values
    .required("⚠ Visit date & time is required.")
    .transform((value, originalValue) =>
      originalValue ? new Date(originalValue) : null
    ),

  durationMinutes: yup
    .number()
    .typeError("⚠ Enter a valid number for duration (minutes).")
    .positive("⚠ Duration must be greater than 0.")
    .integer("⚠ Duration must be a whole number.")
    .required("⚠ Duration is required."),

  purposeOfVisit: yup.string().required("⚠ Purpose of visit is required."),
  staffNotes: yup.string(),
});

/**
 * VisitorForm Component
 * ---------------------
 * - Handles visitor logging and editing.
 * - Provides validation, error handling, and UI enhancements.
 *
 * @component
 * @param {string} inmateId - The ID of the inmate the visitor is visiting.
 * @param {Object} visitorData - The visitor data to be edited (if applicable).
 * @param {Function} onClose - Function to close the form modal.
 * @param {Function} onFormSuccess - Callback function to refresh the visitor list after submission.
 * @returns {JSX.Element} - The visitor form UI component.
 */
const VisitorForm = ({ inmateId, visitorData, onClose, onFormSuccess }) => {
  const isEditMode = !!visitorData; // Check if editing
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(visitorSchema),
    defaultValues: visitorData || {},
  });

  // Prefill form data if editing
  useEffect(() => {
    if (isEditMode && visitorData) {
      Object.keys(visitorData).forEach((key) => {
        setValue(key, visitorData[key]);
      });
    }
  }, [isEditMode, visitorData, setValue]);

  /**
   * Handles form submission.
   * - Sends data to the API for visitor creation or update.
   * - Displays toast notifications for success or error.
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Check inmate's status before allowing visitor logging
      const checkResponse = await axios.get(
        `http://localhost:5000/prisonsphere/inmates/${inmateId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { status } = checkResponse.data;

      // Prevent visitor logging if inmate is not incarcerated
      if (status !== "Incarcerated") {
        toast.error(
          "⚠ Visitor logging denied. This inmate is not incarcerated."
        );
        setLoading(false);
        return;
      }

      let response;

      if (isEditMode) {
        response = await axios.put(
          `http://localhost:5000/prisonsphere/visitors/details/${visitorData._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/prisonsphere/visitors/${inmateId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      toast.success(
        isEditMode
          ? "Visitor details updated!"
          : "New visitor logged successfully!",
        { position: "top-right", autoClose: 2000 }
      );

      setTimeout(() => {
        onClose();
        onFormSuccess(); // Refresh list
      }, 1000);
    } catch (error) {
      toast.error("⚠ Error processing request. Try again.", {
        position: "top-right",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-20 backdrop-blur-lg"
    >
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {isEditMode ? "Edit Visit Details" : "Log New Visit"}
        </h2>

        <ToastContainer />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block">Visitor Name</label>
              <input
                {...register("visitorName")}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-red-500 text-sm">
                {errors.visitorName?.message}
              </p>
            </div>

            <div>
              <label className="block">Relationship</label>
              <input
                {...register("relationshipToInmate")}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-red-500 text-sm">
                {errors.relationshipToInmate?.message}
              </p>
            </div>

            <div>
              <label className="block">Contact Number</label>
              <input
                {...register("contactNumber")}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-red-500 text-sm">
                {errors.contactNumber?.message}
              </p>
            </div>

            <div>
              <label className="block">Email</label>
              <input
                {...register("email")}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block">Visit Date & Time</label>
              <input
                type="datetime-local"
                {...register("visitTimestamp")}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-red-500 text-sm">
                {errors.visitTimestamp?.message}
              </p>
            </div>

            <div>
              <label className="block">Duration (Minutes)</label>
              <input
                type="number"
                {...register("durationMinutes")}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-red-500 text-sm">
                {errors.durationMinutes?.message}
              </p>
            </div>
          </div>

          <div>
            <label className="block">Purpose of Visit</label>
            <input
              {...register("purposeOfVisit")}
              className="w-full p-2 border rounded-md"
            />
            <p className="text-red-500 text-sm">
              {errors.purposeOfVisit?.message}
            </p>
          </div>

          <div>
            <label className="block">Staff Notes</label>
            <textarea
              {...register("staffNotes")}
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading
                ? "Processing..."
                : isEditMode
                ? "Save Changes"
                : "Log Visit"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default VisitorForm;
