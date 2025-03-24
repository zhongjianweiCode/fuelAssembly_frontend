"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SkeletonItem, CreateSkeletonDto, UpdateSkeletonDto } from '@/types/skeleton';
import { useCreateSkeleton, useUpdateSkeleton } from '@/hooks/useSkeleton';
import { toast } from 'sonner';
import { OrderItem } from '@/types/order';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface SkeletonDialogProps {
  open: boolean;
  onClose: () => void;
  data?: SkeletonItem;
  mode: 'add' | 'edit';
  orders: OrderItem[];
}

enum SkeletonStatus {
  CMM = "CMM",
  Laboratory = "Laboratory",
  Customer = "Customer",
  Released = "Released",
  Rejected = "Rejected",
  USED = "Used",
}

enum SkeletonPlatform {
  A = "A",
  B = "B",
}

enum SkeletonType {
  AFA3G_AA = "AFA3G_AA",
  AFA3G_A = "AFA3G_A",
}

const getInitialState = (): CreateSkeletonDto => ({
  sk_number: 'GRH317000',
  perpendiculartity: 0.001,
  flatness: 0.001,
  length: 3973.300,
  platform: SkeletonPlatform.A,
  leg1_length: -134.500,
  leg2_length: -134.500,
  leg3_length: -134.500,
  leg4_length: -134.500,
  type: SkeletonType.AFA3G_AA,
  order_id: null,
  status: SkeletonStatus.CMM,
  x: null,
  y: null,
  created_at: format(new Date(), 'yyyy-MM-dd')
});

export function SkeletonDialog({ open, onClose, data, mode, orders }: SkeletonDialogProps) {
  const [formData, setFormData] = useState<CreateSkeletonDto>(getInitialState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createMutate, isPending: isCreating } = useCreateSkeleton({
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success('Skeleton created successfully');
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast.error('Failed to create skeleton', {
        description: error.message
      });
    }
  });
  
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateSkeleton({
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success('Skeleton updated successfully');
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast.error('Failed to update skeleton', {
        description: error.message
      });
    }
  });

  // Loading state combines all async operations
  const isLoading = isSubmitting || isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    if (data && mode === 'edit') {
      setFormData({
        sk_number: data.sk_number,
        perpendiculartity: data.perpendiculartity,
        flatness: data.flatness,
        length: data.length,
        platform: data.platform,
        leg1_length: data.leg1_length,
        leg2_length: data.leg2_length,
        leg3_length: data.leg3_length,
        leg4_length: data.leg4_length,
        type: data.type,
        order_id: data.order?.id || null,
        status: data.status,
        x: data.x,
        y: data.y,
        created_at: data.created_at
      });
    } else {
      setFormData(getInitialState());
    }
    
    // Reset submitting state when modal opens
    setIsSubmitting(false);
  }, [data, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const validationErrors: string[] = [];

    // Validate sk_number format
    if (!/^GRH\d{6}$/.test(formData.sk_number)) {
      validationErrors.push('Skeleton number must start with GRH followed by 6 digits');
    }

    // Validate numeric ranges
    if (formData.perpendiculartity < 0 || formData.perpendiculartity > 0.25) {
      validationErrors.push('Perpendicularity must be between 0 and 0.25');
    }
    if (formData.flatness < 0 || formData.flatness > 0.15) {
      validationErrors.push('Flatness must be between 0 and 0.15');
    }
    if (formData.length < 3972.5 || formData.length > 3974.1) {
      validationErrors.push('Length must be between 3972.5 and 3974.1');
    }
    
    // Validate leg lengths with null checks
    if (formData.leg1_length === null) {
      validationErrors.push('Leg 1 length is required');
    } else if (formData.leg1_length < -136.0 || formData.leg1_length > -133.0) {
      validationErrors.push('Leg 1 length must be between -136.0 and -133.0');
    }
    
    if (formData.leg2_length === null) {
      validationErrors.push('Leg 2 length is required');
    } else if (formData.leg2_length < -136.0 || formData.leg2_length > -133.0) {
      validationErrors.push('Leg 2 length must be between -136.0 and -133.0');
    }
    
    if (formData.leg3_length === null) {
      validationErrors.push('Leg 3 length is required');
    } else if (formData.leg3_length < -136.0 || formData.leg3_length > -133.0) {
      validationErrors.push('Leg 3 length must be between -136.0 and -133.0');
    }
    
    if (formData.leg4_length === null) {
      validationErrors.push('Leg 4 length is required');
    } else if (formData.leg4_length < -136.0 || formData.leg4_length > -133.0) {
      validationErrors.push('Leg 4 length must be between -136.0 and -133.0');
    }

    // Show validation errors if any
    if (validationErrors.length > 0) {
      toast.error('Validation Error', {
        description: validationErrors.join('\n')
      });
      return;
    }

    // Set submitting state to true to show loading indicators
    setIsSubmitting(true);
    
    // Show loading toast and close modal immediately
    toast.loading(`${mode === 'add' ? 'Creating' : 'Updating'} skeleton...`);
    onClose();

    if (mode === 'edit') {
      if (!data?.id) return;
      const updatePayload: UpdateSkeletonDto = {
        sk_number: formData.sk_number,
        perpendiculartity: Number(formData.perpendiculartity.toFixed(3)),
        flatness: Number(formData.flatness.toFixed(3)),
        length: Number(formData.length.toFixed(3)),
        leg1_length: Number((formData.leg1_length || -134.5).toFixed(3)),
        leg2_length: Number((formData.leg2_length || -134.5).toFixed(3)),
        leg3_length: Number((formData.leg3_length || -134.5).toFixed(3)),
        leg4_length: Number((formData.leg4_length || -134.5).toFixed(3)),
        type: formData.type || '',
        status: formData.status || 'CMM',
        platform: formData.platform || 'A',
        order_id: formData.order_id,
        created_at: format(new Date(formData.created_at), 'yyyy-MM-dd')
      };
      updateMutate({ id: data.id, payload: updatePayload });
    } else {
      const createPayload: CreateSkeletonDto = {
        ...formData,
        perpendiculartity: Number(formData.perpendiculartity.toFixed(3)),
        flatness: Number(formData.flatness.toFixed(3)),
        length: Number(formData.length.toFixed(3)),
        leg1_length: Number((formData.leg1_length || -134.5).toFixed(3)),
        leg2_length: Number((formData.leg2_length || -134.5).toFixed(3)),
        leg3_length: Number((formData.leg3_length || -134.5).toFixed(3)),
        leg4_length: Number((formData.leg4_length || -134.5).toFixed(3)),
        type: formData.type || '',
        status: formData.status || 'CMM',
        platform: formData.platform || 'A',
        order_id: formData.order_id,
        created_at: formData.created_at
      };
      createMutate(createPayload);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;

    if (name === 'sk_number') {
      // Allow only GRH and numbers
      if (!/^(GRH\d*|GRH?)$/.test(value)) {
        return;
      }
    } else if (!['platform', 'type', 'status', 'order_id'].includes(name)) {
      newValue = Number(value);
    }

    // Calculate x and y if all leg lengths are provided
    if (['leg1_length', 'leg2_length', 'leg3_length', 'leg4_length'].includes(name)) {
      const updatedFormData = { ...formData, [name]: newValue };
      const { leg1_length, leg2_length, leg3_length, leg4_length } = updatedFormData;
      
      if (leg1_length && leg2_length && leg3_length && leg4_length) {
        const x = round(((leg4_length + leg1_length) / 2 - (leg2_length + leg3_length) / 2) * 20, 3);
        const y = round(((leg4_length + leg3_length) / 2 - (leg2_length + leg1_length) / 2) * 20, 3);
        setFormData({ ...updatedFormData, x, y });
        return;
      }
    }
    
    setFormData((prev: CreateSkeletonDto) => ({ ...prev, [name]: newValue }));
  };

  const round = (num: number, decimals: number) => {
    return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1e293b',
          letterSpacing: '0.025em'
        }}
      >
        {mode === 'add' ? 'Add New Skeleton' : 'Edit Skeleton'}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#64748b',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              color: '#475569',
              transform: 'rotate(90deg)',
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent 
          dividers
          sx={{
            padding: '24px',
            background: '#ffffff',
            borderTop: 'none',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Box 
            sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(2, 1fr)',
              '& .MuiTextField-root': {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.75rem',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#94a3b8'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: '2px'
                    }
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#6366f1'
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0',
                  transition: 'all 0.2s ease-in-out'
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  padding: '12px 16px'
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: '4px',
                  fontSize: '0.75rem'
                }
              },
              '& .MuiMenuItem-root': {
                fontSize: '0.875rem',
                color: '#475569',
                '&:hover': {
                  backgroundColor: '#f1f5f9'
                },
                '&.Mui-selected': {
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  '&:hover': {
                    backgroundColor: '#ddd6fe'
                  }
                }
              },
              '& .MuiPickersLayout-root': {
                borderRadius: '0.75rem',
                overflow: 'hidden',
                '& .MuiPickersToolbar-root': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white'
                },
                '& .MuiPickersDay-root': {
                  '&.Mui-selected': {
                    backgroundColor: '#6366f1',
                    '&:hover': {
                      backgroundColor: '#4f46e5'
                    }
                  }
                }
              }
            }}
          >
            <TextField
              label="Skeleton Number"
              name="sk_number"
              value={formData.sk_number}
              onChange={handleChange}
              // helperText="Format: GRH followed by 6 digits (e.g., GRH123456)"
              error={formData.sk_number !== '' && !/^GRH\d{6}$/.test(formData.sk_number)}
              fullWidth
              required
            />
            <TextField
              label="Platform"
              name="platform"
              select
              value={formData.platform}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
            </TextField>
            <TextField
              label="Status"
              name="status"
              select
              value={formData.status}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="CMM">CMM</MenuItem>
              <MenuItem value="Laboratory">Laboratory</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="Released">Released</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Used">Used</MenuItem>
            </TextField>
            <TextField
              label="Perpendicularity"
              name="perpendiculartity"
              type="number"
              value={formData.perpendiculartity}
              onChange={handleChange}
              inputProps={{
                min: 0,
                max: 0.25,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Flatness"
              name="flatness"
              type="number"
              value={formData.flatness}
              onChange={handleChange}
              inputProps={{
                min: 0,
                max: 0.15,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Length"
              name="length"
              type="number"
              value={formData.length}
              onChange={handleChange}
              inputProps={{
                min: 3972.5,
                max: 3974.1,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Leg 1 Length"
              name="leg1_length"
              type="number"
              value={formData.leg1_length}
              onChange={handleChange}
              inputProps={{
                min: -136.0,
                max: -133.0,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Leg 2 Length"
              name="leg2_length"
              type="number"
              value={formData.leg2_length}
              onChange={handleChange}
              inputProps={{
                min: -136.0,
                max: -133.0,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Leg 3 Length"
              name="leg3_length"
              type="number"
              value={formData.leg3_length}
              onChange={handleChange}
              inputProps={{
                min: -136.0,
                max: -133.0,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Leg 4 Length"
              name="leg4_length"
              type="number"
              value={formData.leg4_length}
              onChange={handleChange}
              inputProps={{
                min: -136.0,
                max: -133.0,
                step: 0.001
              }}
              fullWidth
              required
            />
            <TextField
              label="Type"
              name="type"
              value={formData.type || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Order"
              name="order"
              select
              value={formData.order_id || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  order_id: e.target.value || null
                }));
              }}
              fullWidth
              required
            >
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {`${order.order_name} (${order.order_batch})`}
                </MenuItem>
              ))}
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Production Date"
                value={formData.created_at ? new Date(formData.created_at) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    const formattedDate = format(newValue, 'yyyy-MM-dd');
                    console.log('Selected date:', formattedDate);
                    setFormData(prev => ({
                      ...prev,
                      created_at: formattedDate
                    }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem',
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 3,
            background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
            gap: 2
          }}
        >
          <Button 
            onClick={onClose} 
            sx={{
              color: '#64748b',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '8px 24px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              letterSpacing: '0.025em',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: 'none'
              }
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={18} color="inherit" />}
            sx={{
              background: isLoading 
                ? '#a5b4fc'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '8px 24px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              letterSpacing: '0.025em',
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: isLoading 
                  ? '#a5b4fc' 
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                transform: isLoading ? 'none' : 'translateY(-1px)',
                boxShadow: isLoading ? 'none' : '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px -1px rgba(99, 102, 241, 0.1)',
                background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)'
              },
              '&.Mui-disabled': {
                background: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {isLoading 
              ? (mode === 'add' ? 'Creating...' : 'Saving...') 
              : (mode === 'add' ? 'Create' : 'Save Changes')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 