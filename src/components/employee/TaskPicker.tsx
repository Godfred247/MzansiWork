import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDownIcon, PlusIcon } from 'lucide-react';
import { api, ApiError, readToken } from '../../api/client';
import { workCategories } from '../../data/projects';
import { useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { isLiveOrg } from '../../utils/workspace';
import { actorId } from '../../utils/selectors';
import type { EmployeeWorkOptions, EmployeeWorkProject } from '../../types/workspace';
import { Button } from '../shared/Button';
import { Dialog } from '../shared/Dialog';
import { Field } from '../shared/Field';
import { SelectInput } from '../shared/SelectInput';
import { TextInput } from '../shared/TextInput';

export interface TaskValue {
  projectId?: string;
  taskId?: string;
  category: string;
}

const emptyOptions: EmployeeWorkOptions = { projects: [], tasks: [], categories: [] };

export function TaskPicker({ value, onChange, idPrefix }: {value: TaskValue;onChange: (v: TaskValue) => void;idPrefix: string;}) {
  const { state, dispatch } = useDemo();
  const layout = useEmployeeLayout();
  const memberId = actorId(state);
  const ownOptions = state.employeeWorkOptions ?? emptyOptions;
  const projects = useMemo(() => {
    const orgProjects = state.projects.filter((project) => project.members.includes(memberId) && project.status === 'active');
    return [
      ...orgProjects.map((project) => ({ id: project.id, name: project.name, billable: project.billable, tasks: project.tasks.filter((task) => task.assignees.includes(memberId)) })),
      ...ownOptions.projects.map((project) => ({ ...project, billable: false, tasks: [] }))
    ];
  }, [memberId, ownOptions.projects, state.projects]);
  const project = projects.find((item) => item.id === value.projectId);
  const tasks = [
    ...(project?.tasks ?? []),
    ...ownOptions.tasks.filter((task) => task.projectId === value.projectId)
  ];
  const categories = [...new Set([...workCategories, ...ownOptions.categories])];
  const [manageOpen, setManageOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!taskProjectId && projects[0]) setTaskProjectId(projects[0].id);
  }, [projects, taskProjectId]);

  const saveOptions = async (options: EmployeeWorkOptions) => {
    setSaving(true);
    setError('');
    try {
      let saved = options;
      if (isLiveOrg(state.orgId) && !state.flow) {
        const token = readToken('employee');
        if (!token) throw new ApiError('Your sign-in has expired. Sign in again before saving work options.');
        saved = await api<EmployeeWorkOptions>('/api/employee/work-options', { method: 'PUT', body: options, token });
      }
      dispatch({ type: 'SET_EMPLOYEE_WORK_OPTIONS', options: saved });
      return saved;
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Your work options could not be saved.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const addProject = async (event: FormEvent) => {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return setError('Enter a project name.');
    if (projects.some((item) => item.name.toLowerCase() === name.toLowerCase())) return setError('That project is already on your list.');
    const project: EmployeeWorkProject = { id: crypto.randomUUID(), name };
    const saved = await saveOptions({ ...ownOptions, projects: [...ownOptions.projects, project] });
    if (saved) {
      setProjectName('');
      setTaskProjectId(project.id);
      onChange({ ...value, projectId: project.id, taskId: undefined, category: 'Internal projects' });
    }
  };

  const addTask = async (event: FormEvent) => {
    event.preventDefault();
    const name = taskName.trim();
    if (!taskProjectId) return setError('Choose a project for this task.');
    if (!name) return setError('Enter a task name.');
    const orgTaskNames = state.projects.find((item) => item.id === taskProjectId)?.tasks
      .filter((task) => task.assignees.includes(memberId))
      .map((task) => task.name) ?? [];
    if ([...orgTaskNames, ...ownOptions.tasks.filter((task) => task.projectId === taskProjectId).map((task) => task.name)]
      .some((existing) => existing.toLowerCase() === name.toLowerCase())) return setError('That task is already on this project.');
    const saved = await saveOptions({
      ...ownOptions,
      tasks: [...ownOptions.tasks, { id: crypto.randomUUID(), projectId: taskProjectId, name }]
    });
    if (saved) {
      setTaskName('');
      onChange({ ...value, projectId: taskProjectId, taskId: saved.tasks[saved.tasks.length - 1]?.id ?? undefined });
    }
  };

  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return setError('Enter a work category.');
    if (categories.some((category) => category.toLowerCase() === name.toLowerCase())) return setError('That work category is already available.');
    const saved = await saveOptions({ ...ownOptions, categories: [...ownOptions.categories, name] });
    if (saved) {
      setCategoryName('');
      onChange({ ...value, category: name });
    }
  };

  return (
    <>
      <div className={layout === 'narrow' ? 'grid gap-3' : 'grid grid-cols-3 gap-3'}>
        <Field label="Project" htmlFor={`${idPrefix}-project`} optional>
          <SelectInput
            id={`${idPrefix}-project`}
            value={value.projectId ?? ''}
            onChange={(event) => {
              const selected = projects.find((item) => item.id === event.target.value);
              onChange({
                ...value,
                projectId: event.target.value || undefined,
                taskId: undefined,
                category: selected ? selected.billable ? 'Client work' : 'Internal projects' : value.category
              });
            }}
            options={[{ value: '', label: 'Choose later' }, ...projects.map((item) => ({ value: item.id, label: item.name }))]} />
        </Field>
        <Field label="Task" htmlFor={`${idPrefix}-task`} optional>
          <SelectInput
            id={`${idPrefix}-task`}
            value={value.taskId ?? ''}
            disabled={!project}
            onChange={(event) => onChange({ ...value, taskId: event.target.value || undefined })}
            options={[{ value: '', label: project ? 'No specific task' : 'Pick a project first' }, ...tasks.map((task) => ({ value: task.id, label: task.name }))]} />
        </Field>
        <Field label="Work category" htmlFor={`${idPrefix}-cat`}>
          <SelectInput id={`${idPrefix}-cat`} value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value })} options={categories.map((category) => ({ value: category, label: category }))} />
        </Field>
      </div>
      <div className="mt-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          icon={<PlusIcon className="h-3.5 w-3.5" />}
          disabled={state.employeeWorkOptionsLoading}
          onClick={() => { setError(''); setManageOpen(true); }}>
          Add your own project, task or category
        </Button>
      </div>
      <Dialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title="Your work options"
        description="These projects, tasks and categories are saved for your employee account."
        footer={<Button variant="secondary" onClick={() => setManageOpen(false)}>Done</Button>}>
        {state.employeeWorkOptionsLoading ?
          <p className="py-4 text-sm text-muted">Loading your saved work options…</p> :
          <div className="space-y-5 pb-3">
            <p className="flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs font-medium text-primary">
              <ArrowDownIcon className="h-4 w-4 shrink-0" aria-hidden />
              Scroll down to add tasks and work categories.
            </p>
            {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
            <form className="space-y-2" onSubmit={addProject}>
              <Field label="Add a project" htmlFor={`${idPrefix}-new-project`}>
                <TextInput id={`${idPrefix}-new-project`} value={projectName} maxLength={100} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" />
              </Field>
              <Button type="submit" size="sm" loading={saving}>Save project</Button>
            </form>
            <form className="space-y-2" onSubmit={addTask}>
              <Field label="Add a task" htmlFor={`${idPrefix}-task-project`}>
                <SelectInput
                  id={`${idPrefix}-task-project`}
                  value={taskProjectId}
                  onChange={(event) => setTaskProjectId(event.target.value)}
                  options={projects.map((item) => ({ value: item.id, label: item.name }))} />
              </Field>
              <Field label="Task name" htmlFor={`${idPrefix}-new-task`}>
                <TextInput id={`${idPrefix}-new-task`} value={taskName} maxLength={100} onChange={(event) => setTaskName(event.target.value)} placeholder="Task name" />
              </Field>
              <Button type="submit" size="sm" loading={saving} disabled={projects.length === 0}>Save task</Button>
            </form>
            <form className="space-y-2" onSubmit={addCategory}>
              <Field label="Add a work category" htmlFor={`${idPrefix}-new-category`}>
                <TextInput id={`${idPrefix}-new-category`} value={categoryName} maxLength={80} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" />
              </Field>
              <Button type="submit" size="sm" loading={saving}>Save category</Button>
            </form>
          </div>
        }
      </Dialog>
    </>
  );
}
