"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateAcademicDetails } from "@/lib/actions/academic.action";
import { AcademicDetails } from "@/types";

const AcademicDetailsForm = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AcademicDetails>({
    highestEducation: "bachelor",
    field: "",
    institution: "",
    graduationYear: new Date().getFullYear(),
    cgpa: undefined,
    isCurrentlyStudent: false,
    hasBacklogs: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateAcademicDetails(userId, formData);
      
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch {
      alert("Failed to update academic details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? Number(value) : 
              type === "text" && name === "cgpa" ? (value ? Number(value) : undefined) : 
              value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-2xl font-bold mb-6 text-black">Complete Your Academic Profile</h2>
      <p className="text-gray-600 mb-6">
        Please provide your academic details to check your eligibility for mock interviews.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Highest Education Level</label>
          <select
            name="highestEducation"
            value={formData.highestEducation}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="high-school">High School</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Field of Study</label>
          <input
            type="text"
            name="field"
            value={formData.field}
            onChange={handleChange}
            placeholder="e.g., Computer Science, Software Engineering"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Institution Name</label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            placeholder="e.g., Stanford University"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Graduation Year</label>
          <input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            min="1950"
            max={new Date().getFullYear() + 10}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CGPA (Optional)</label>
          <input
            type="text"
            name="cgpa"
            value={formData.cgpa || ""}
            onChange={handleChange}
            placeholder="e.g., 8.5"
            step="0.1"
            min="0"
            max="10"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isCurrentlyStudent"
            checked={formData.isCurrentlyStudent}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">I am currently a student</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasBacklogs"
            checked={formData.hasBacklogs}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">I have current backlogs</label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Academic Details"}
        </Button>
      </form>
    </div>
  );
};

export default AcademicDetailsForm;
