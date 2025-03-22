import { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";
import { isValidReleaseNumber } from "@/types/release";

interface CreateReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (releaseNumber: string) => void;
  isLoading: boolean;
}

export const CreateReleaseModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateReleaseModalProps) => {
  const [releaseNumber, setReleaseNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidReleaseNumber(releaseNumber)) {
      setError("Please enter the correct release number format (XX-XX-XX/YYY)");
      return;
    }
    onSubmit(releaseNumber);
    setReleaseNumber("");
    setError("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new skeleton release">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="releaseNumber" className="block text-sm font-semibold text-blue-900">
            Release Number
          </label>
          <div className="relative">
            <Input
              id="releaseNumber"
              value={releaseNumber}
              onChange={(e) => {
                setReleaseNumber(e.target.value);
                setError("");
              }}
              placeholder="Please enter the release number (example: 23-01-01/001)"
              className="rounded-xl border-blue-200 bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-200/50 h-12 text-sm pl-4 transition-all duration-200"
              required
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-600/5 pointer-events-none" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white border-2 border-blue-100 hover:bg-blue-50 hover:border-blue-200 text-blue-700 h-12 px-6 font-medium transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-12 px-8 flex gap-2 items-center justify-center font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <MdAdd className="w-5 h-5" />
                <span>Create</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 