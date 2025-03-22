import { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";
import { isValidSkeletonNumber } from "@/types/release";

interface AddSkeletonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skeletonNumber: string) => void;
  isLoading: boolean;
  title?: string;
}

export const AddSkeletonModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title = "Add skeleton",
}: AddSkeletonModalProps) => {
  const [skeletonNumber, setSkeletonNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSkeletonNumber = skeletonNumber.trim().toUpperCase();
    
    if (!isValidSkeletonNumber(cleanedSkeletonNumber)) {
      setError("Please enter a valid skeleton number (format: GRH followed by 6 digits)");
      return;
    }

    onSubmit(cleanedSkeletonNumber);
  };

  const handleClose = () => {
    setSkeletonNumber("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2.5">
          <label 
            htmlFor="skeletonNumber" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Skeleton Number
          </label>
          <div className="relative group">
            <Input
              id="skeletonNumber"
              value={skeletonNumber}
              onChange={(e) => {
                setSkeletonNumber(e.target.value);
                setError("");
              }}
              placeholder="Enter skeleton number (e.g., GRH123456)"
              className={`h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm pl-4 pr-4 transition-all duration-200 placeholder:text-gray-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              required
            />
            <div className={`absolute inset-0 rounded-lg ring-1 ring-inset ${error ? 'ring-red-300 group-hover:ring-red-400' : 'ring-gray-200 group-hover:ring-gray-300'} pointer-events-none transition-colors duration-200`} />
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-2 flex items-start">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="leading-5">{error}</span>
            </p>
          )}
        </div>

        <div className="flex justify-end items-center gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            className="h-10 px-5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium text-sm transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 px-5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm flex items-center gap-2 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <MdAdd className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 