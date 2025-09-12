import { useMDXComponents as getThemeComponents } from "nextra-theme-docs"; // nextra-theme-blog or your custom theme
import { MDXRemote } from 'nextra/mdx-remote';
import { compileMdx } from 'nextra/compile';

// Get the default MDX components
const themeComponents = getThemeComponents();

// Function Documentation Component
async function FunctionDoc({ name, description, tips, code, category }: {
  name: string;
  description: string;
  tips?: string;
  code?: string;
  category?: string;
}) {
  const markdownContent = `\`\`\`typescript
${code}
\`\`\``;

  const compiledSource = await compileMdx(markdownContent);

  return (
    <div className="function-doc mb-8 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-mono text-sm">
            {name}
          </code>
        </h3>
        {category && (
          <span className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
            {category}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Description:</span> {description}
          </p>
        </div>
        
        {tips && (
          <div className="flex items-start gap-2">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-gray-100">💡Tips:</span> {tips}
            </p>
          </div>
        )}
      </div>
      
      {code && (<div className="mt-4">
        <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 overflow-x-auto">
          <MDXRemote compiledSource={compiledSource} />
        </div>
      </div>)}
    </div>
  );
}

// Function Section Component
async function FunctionSection({ title, functions, category }: {
  title: string;
  functions: Array<{
    name: string;
    description: string;
    tips?: string;
    code: string;
  }>;
  category?: string;
}) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
      <div className="space-y-6">
        {await Promise.all(functions.map(async (func, index) => (
          <FunctionDoc
            key={index}
            name={func.name}
            description={func.description}
            tips={func.tips}
            code={func.code}
            category={category}
          />
        )))}
      </div>
    </div>
  );
}

// Merge components
export function useMDXComponents(components: any) {
  return {
    ...themeComponents,
    ...components,
    FunctionDoc,
    FunctionSection,
  };
}
