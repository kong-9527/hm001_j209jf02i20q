'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProjects } from '../services/projectService';

interface WithProjectCheckProps {
  children: ReactNode;
}

export default function WithProjectCheck({ children }: WithProjectCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkProjects = async () => {
      try {
        setIsLoading(true);
        const projects = await getUserProjects();
        
        // 判断当前路径是否需要检查项目列表
        const needsProjectCheck = pathname?.startsWith('/dashboard/garden-design') || 
                                 pathname?.startsWith('/dashboard/garden-advisor');
        
        // 只有需要检查的路径且项目列表为空时才进行重定向
        if (needsProjectCheck && projects.length === 0) {
          console.log("No projects found, redirecting to projects page");
          router.push('/dashboard/projects');
        }
      } catch (error) {
        console.error('Error checking projects:', error);
        // 出错时也重定向到projects页面，但仅针对需要检查的路径
        if (pathname?.startsWith('/dashboard/garden-design') || 
            pathname?.startsWith('/dashboard/garden-advisor')) {
          router.push('/dashboard/projects');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkProjects();
  }, [router, pathname]);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-green-500 animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}