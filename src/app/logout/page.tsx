"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiAlertCircle, FiLogOut, FiX } from 'react-icons/fi';


export default function Page() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    setIsSubmitting(true);
    logout()
      .then(() => {
        setIsSubmitting(false);
        router.replace('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        setIsSubmitting(false);
      });
  }  

  return (
    <div className="min-h-screen flex items-center justify-center ">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-[400px] relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-30 pointer-events-none" />

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Confirm Logout
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                Are you sure you want to logout?
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <p className="text-sm text-slate-600">
            You will need to log in again to access your account.
          </p>
        </CardContent>

        <div className="px-6 pb-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 transition-transform hover:scale-[1.02]"
              onClick={() => router.back()}
            >
              <FiX className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed justify-center"
            >
              <FiLogOut className="w-4 h-4" />
              {isSubmitting ? "Logging out..." : "Confirm Logout"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  </div>
  )
};

