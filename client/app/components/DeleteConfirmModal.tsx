'use client';

interface DeleteConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  title?: string;
  messageText?: string;
}

export function DeleteConfirmModal({ 
  onClose, 
  onConfirm, 
  projectName,
  title = "Delete Project",
  messageText = `Are you sure you want to delete the project "<span className="font-medium">${projectName}</span>" ? This action cannot be undone.`
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          
          <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: messageText }}>
          </p>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 