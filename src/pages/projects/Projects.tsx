import { Card } from "@/components/ui/Card";
import { FolderKanban } from "lucide-react";

const ProjectsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card className="min-h-[600px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">프로젝트/운영</p>
          <p className="text-sm mt-2">추후 개발 예정입니다.</p>
        </div>
      </Card>
    </div>
  );
};

export default ProjectsPage;
