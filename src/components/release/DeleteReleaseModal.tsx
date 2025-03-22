import { Modal } from "../common/Modal";
import { Button } from "../ui/button";
import { MdDelete } from "react-icons/md";
import { ReleaseDetailResponse } from "@/types/release";

interface DeleteReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  release: ReleaseDetailResponse | null;
}

export const DeleteReleaseModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  release,
}: DeleteReleaseModalProps) => {
  if (!release) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Release">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <MdDelete className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Delete Release Confirmation
            </h3>
            <p className="text-red-700">
              Are you sure you want to delete release{" "}
              <span className="font-semibold">{release.release_number}</span>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white border-2 border-red-100 hover:bg-red-50 hover:border-red-200 text-red-700 h-12 px-6 font-medium transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white h-12 px-8 flex gap-2 items-center justify-center font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <MdDelete className="w-5 h-5" />
                <span>Delete</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 