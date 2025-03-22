"use client";

import { useCreateWaitlist } from "@/hooks/useWaitlists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";
import { MdCreateNewFolder } from "react-icons/md";

export const CreateWaitlistForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const { mutate: createMutate, isPending } = useCreateWaitlist();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    createMutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          toast.success("List created", {
            description: "New waitlist has been added successfully",
            className: "bg-blue-100 border-blue-200 text-blue-900",
          });
          setEmail("");
          onSuccess?.();
        },
        onError: () => {
          toast.error("Creation failed", {
            description: "Please check your input and try again",
            className: "bg-red-100 border-red-200 text-red-900",
          });
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-blue-50">
      <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-3 md:mb-4">
        Create New Waitlist
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:gap-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter waitlist email"
          className="rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-200/50 h-12 text-sm md:text-base"
          required
        />
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-12 px-4 md:px-8 flex gap-2 items-center justify-center"
        >
          {isPending ? (
            <>
              <LoadingSpinner />
              <span className="text-sm md:text-base">Creating...</span>
            </>
          ) : (
            <>
              <MdCreateNewFolder className="w-12 h-12" />
              <span className="text-sm md:text-base">Create Now</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};