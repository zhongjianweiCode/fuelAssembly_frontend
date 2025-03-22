import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";
import { isValidSkeletonNumber } from "@/types/release";
import { Textarea } from "../ui/textarea";

interface BatchAddSkeletonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skeletonNumbers: string[]) => void;
  isLoading: boolean;
}

export const BatchAddSkeletonsModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: BatchAddSkeletonsModalProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 分割输入的骨架编号
    const skeletonNumbers = input
      .split(/[\n,，]/)
      .map(num => num.trim())
      .filter(Boolean);

    // 验证每个骨架编号
    const invalidNumbers = skeletonNumbers.filter(num => !isValidSkeletonNumber(num));
    if (invalidNumbers.length > 0) {
      setError(`The following skeleton numbers are invalid: ${invalidNumbers.join(", ")}`);
      return;
    }

    if (skeletonNumbers.length === 0) {
      setError("Please enter at least one skeleton number");
      return;
    }

    onSubmit(skeletonNumbers);
    setInput("");
    setError("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Add Skeletons">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="skeletonNumbers" className="block text-sm font-semibold text-blue-900">
            Skeleton Number List
          </label>
          <div className="relative">
            <Textarea
              id="skeletonNumbers"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder="Please enter the skeleton number, one per line or separated by commas.&#10;For example:&#10;GRH123456,&#10;GRH234567"
              className="min-h-[160px] rounded-xl border-blue-200 bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-200/50 text-sm transition-all duration-200"
              required
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-600/5 pointer-events-none" />
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          <p className="text-sm text-gray-500">
            Support multiple input formats: one per line or separated by commas
          </p>
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
                <span>Adding...</span>
              </>
            ) : (
              <>
                <MdAdd className="w-5 h-5" />
                <span>Batch Add</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 