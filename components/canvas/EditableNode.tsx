import { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

interface EditableNodeProps {
  data: {
    label: string;
    type: string;
  };
  selected: boolean;
}

export default function EditableNode({ data, selected }: EditableNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    data.label = text;
  }, [data, text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      data.label = text;
    }
  }, [data, text]);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const getNodeStyle = () => {
    const baseStyle = 'min-w-[200px] max-w-[400px] bg-white shadow-lg border border-gray-200 transition-all';
    switch (data.type) {
      case 'circle':
        return `${baseStyle} rounded-full aspect-square flex items-center justify-center p-4`;
      case 'diamond':
        return `${baseStyle} rotate-45 aspect-square`;
      case 'image':
        return `${baseStyle} rounded-lg overflow-hidden`;
      default:
        return `${baseStyle} rounded-lg`;
    }
  };

  const getContentStyle = () => {
    switch (data.type) {
      case 'diamond':
        return 'rotate-[-45deg] w-full h-full flex items-center justify-center p-4';
      default:
        return 'p-4';
    }
  };

  return (
    <div className={`${getNodeStyle()} ${selected ? 'border-blue-500 border-2' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      
      <div className={getContentStyle()}>
        {data.type === 'image' ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Node content"
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleImageClick}
              />
            ) : (
              <div
                className="w-full h-[200px] bg-gray-100 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 transition-colors"
                onClick={handleImageClick}
              >
                Click to add image
              </div>
            )}
          </>
        ) : (
          isEditing ? (
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full min-h-[100px] p-2 border-none outline-none resize-none bg-transparent text-center"
              placeholder="Enter text..."
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="w-full h-full min-h-[100px] break-words text-center cursor-text"
            >
              {text || 'Double click to edit'}
            </div>
          )
        )}
      </div>
    </div>
  );
} 