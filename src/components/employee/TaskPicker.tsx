import { actorId } from '../../utils/selectors';
import { workCategories } from '../../data/projects';
import { useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { Field } from '../shared/Field';
import { SelectInput } from '../shared/SelectInput';

export interface TaskValue {
  projectId?: string;
  taskId?: string;
  category: string;
}

export function TaskPicker({ value, onChange, idPrefix }: {value: TaskValue;onChange: (v: TaskValue) => void;idPrefix: string;}) {
  const { state } = useDemo();
  const layout = useEmployeeLayout();
  const myProjects = state.projects.filter((p) => p.members.includes(actorId(state)) && p.status === 'active');
  const project = myProjects.find((p) => p.id === value.projectId);
  const tasks = project?.tasks.filter((t) => t.assignees.includes(actorId(state))) ?? [];

  return (
    <div className={layout === 'narrow' ? 'grid gap-3' : 'grid grid-cols-3 gap-3'}>
      <Field label="Project" htmlFor={`${idPrefix}-project`} optional>
        <SelectInput
          id={`${idPrefix}-project`}
          value={value.projectId ?? ''}
          onChange={(e) => {
            const p = myProjects.find((x) => x.id === e.target.value);
            onChange({ ...value, projectId: e.target.value || undefined, taskId: undefined, category: p ? p.billable ? 'Client work' : 'Internal projects' : value.category });
          }}
          options={[{ value: '', label: 'Choose later' }, ...myProjects.map((p) => ({ value: p.id, label: p.name }))]} />
        
      </Field>
      <Field label="Task" htmlFor={`${idPrefix}-task`} optional>
        <SelectInput
          id={`${idPrefix}-task`}
          value={value.taskId ?? ''}
          disabled={!project}
          onChange={(e) => onChange({ ...value, taskId: e.target.value || undefined })}
          options={[{ value: '', label: project ? 'No specific task' : 'Pick a project first' }, ...tasks.map((t) => ({ value: t.id, label: t.name }))]} />
        
      </Field>
      <Field label="Work category" htmlFor={`${idPrefix}-cat`}>
        <SelectInput id={`${idPrefix}-cat`} value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} options={workCategories.map((c) => ({ value: c, label: c }))} />
      </Field>
    </div>);

}