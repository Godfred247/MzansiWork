import { useState } from 'react';
import { FolderKanbanIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { Dialog } from '../../../components/shared/Dialog';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Field } from '../../../components/shared/Field';
import { SelectInput } from '../../../components/shared/SelectInput';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { TextArea } from '../../../components/shared/TextArea';
import { TextInput } from '../../../components/shared/TextInput';
import { Toggle } from '../../../components/shared/Toggle';
import { useDemo } from '../../../contexts/DemoStore';
import { workCategories } from '../../../data/projects';
import { can } from '../../../utils/permissions';
import { memberById } from '../../../utils/selectors';

export function Projects() {
  const { state, dispatch } = useDemo();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [taskFor, setTaskFor] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskBillable, setTaskBillable] = useState(true);
  const [error, setError] = useState('');
  const mayManage = can(state.viewerRole, 'manage_employees');

  const saveProject = () => {
    if (name.trim().length < 3) {
      setError('Give the project a name of at least 3 characters.');
      return;
    }
    dispatch({
      type: 'ADD_PROJECT',
      project: {
        id: `p-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || 'No description yet.',
        billable,
        status: 'active',
        members: [],
        tasks: [],
        hoursWeek: 0
      }
    });
    setOpen(false);
    setName('');
    setDescription('');
    setError('');
  };

  const saveTask = () => {
    if (!taskFor || taskName.trim().length < 2) {
      setError('Enter a task name.');
      return;
    }
    dispatch({ type: 'ADD_TASK', projectId: taskFor, name: taskName.trim(), billable: taskBillable });
    setTaskFor(null);
    setTaskName('');
    setError('');
  };

  return (
    <>
      <MobileHeader
        title="Tasks and projects"
        subtitle="Lightweight time allocation — not a full project suite"
        actions={mayManage ? <Button size="sm" onClick={() => setOpen(true)}>Add</Button> : undefined} />
      <ScreenBody>
        {state.projects.length === 0 ?
        <EmptyState icon={FolderKanbanIcon} title="No projects yet" body="Create a project so employees can record time against it when they clock in." action={mayManage ? <Button onClick={() => setOpen(true)}>Create a project</Button> : undefined} /> :
        state.projects.map((p) =>
        <MSection key={p.id} title={p.client ?? 'Internal'} footer={p.description}>
            <MRow
              title={p.name}
              subtitle={`${p.members.length} people · ${p.hoursWeek}h this week`}
              trailing={<StatusBadge tone={p.status === 'active' ? 'success' : p.status === 'paused' ? 'warning' : 'neutral'} label={p.status === 'active' ? 'Active' : p.status === 'paused' ? 'Paused' : 'Completed'} />}
              chevron={false} />
            <MRow title="Billing" subtitle={p.billable ? 'Billable to a client' : 'Non-billable internal work'} chevron={false} />
            {p.members.length > 0 &&
          <MRow title="Assigned" subtitle={p.members.map((id) => memberById(state, id)?.name.split(' ')[0]).filter(Boolean).join(', ')} chevron={false} />
            }
            {p.tasks.map((t) =>
          <MRow key={t.id} title={t.name} subtitle={`${t.billable ? 'Billable' : 'Non-billable'} · ${t.assignees.length} assigned`} trailing={<StatusBadge tone={t.status === 'open' ? 'info' : 'neutral'} label={t.status === 'open' ? 'Open' : 'Done'} />} chevron={false} />
          )}
            {mayManage && <div className="p-3"><Button full size="sm" variant="secondary" onClick={() => {setTaskFor(p.id);setTaskBillable(p.billable);setError('');}}>Add a task</Button></div>}
          </MSection>
        )}
        <MSection title="Work categories" footer="Employees can pick one of these at clock-in. A task is optional unless your policy makes it mandatory.">
          {workCategories.map((c) => <MRow key={c} title={c} chevron={false} />)}
        </MSection>
      </ScreenBody>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New project"
        description="Employees can record time against it. This does not replace a project-management tool."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={saveProject}>Create project</Button></>}>
        <div className="space-y-3 pb-2">
          <Field label="Project name" htmlFor="proj-name" error={error}>
            <TextInput id="proj-name" value={name} onChange={(e) => {setName(e.target.value);setError('');}} placeholder="e.g. Client onboarding" />
          </Field>
          <Field label="Description" htmlFor="proj-desc" optional>
            <TextArea id="proj-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Toggle checked={billable} onChange={setBillable} label="Billable" description="Time on this project can be marked for client billing." />
        </div>
      </Dialog>

      <Dialog
        open={!!taskFor}
        onClose={() => setTaskFor(null)}
        title="New task"
        footer={<><Button variant="secondary" onClick={() => setTaskFor(null)}>Cancel</Button><Button onClick={saveTask}>Add task</Button></>}>
        <div className="space-y-3 pb-2">
          <Field label="Task name" htmlFor="task-name" error={error}>
            <TextInput id="task-name" value={taskName} onChange={(e) => {setTaskName(e.target.value);setError('');}} placeholder="e.g. Weekly status meeting" />
          </Field>
          <Field label="Billable" htmlFor="task-bill">
            <SelectInput id="task-bill" value={taskBillable ? 'yes' : 'no'} onChange={(e) => setTaskBillable(e.target.value === 'yes')} options={[{ value: 'yes', label: 'Billable' }, { value: 'no', label: 'Non-billable' }]} />
          </Field>
        </div>
      </Dialog>
    </>);
}
