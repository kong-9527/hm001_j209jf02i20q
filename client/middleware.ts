import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 记录请求路径，用于调试
  console.log('Middleware处理请求:', request.nextUrl.pathname);

  // 检查请求是否为garden-advisor详情页面
  const isGardenAdvisorDetail = request.nextUrl.pathname.startsWith('/dashboard/garden-advisor/');
  
  if (isGardenAdvisorDetail) {
    console.log('处理garden-advisor详情页面请求');
    
    // 获取ID部分
    const id = request.nextUrl.pathname.split('/').pop();
    
    // 如果ID存在，则继续处理
    if (id) {
      // 设置自定义请求头，确保ID能够被正确传递
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-garden-advisor-id', id);
      
      // 继续处理请求
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // 对于其他请求，直接继续处理
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径，但排除静态资源和API路由
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}; 