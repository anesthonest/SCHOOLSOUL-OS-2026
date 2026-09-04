import React from 'react';
import { UniversalQRScannerModal } from '../common/UniversalQRScannerModal';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  return (
    <UniversalQRScannerModal
      isOpen={isOpen}
      onClose={onClose}
      onSelectStudent={onSelectStudent}
      workflowContext="STUDENTS"
    />
  );
};
