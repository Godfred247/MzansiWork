import type { Project } from '../types/time';

export const workCategories = ['Client work', 'Internal projects', 'Meetings', 'General administration', 'Training'];

export const breakCategories = [
{ id: 'Tea break', expectedMin: 15, paid: true },
{ id: 'Lunch break', expectedMin: 45, paid: false },
{ id: 'Smoke break', expectedMin: 10, paid: true },
{ id: 'Personal break', expectedMin: 15, paid: false },
{ id: 'Other', expectedMin: 15, paid: false }];


export const inactivityCategories = [
{ id: 'In-person meeting', hint: 'A meeting away from your computer' },
{ id: 'Telephone call', hint: 'A work call on your phone' },
{ id: 'Reading printed documents', hint: 'Reviewing printouts or notes' },
{ id: 'Training', hint: 'A session or course away from the computer' },
{ id: 'Work away from desk', hint: 'e.g. whiteboard session, site visit' },
{ id: 'This was a break', hint: 'Record it as a break instead' },
{ id: 'Other', hint: 'Explain in the notes' }];


export const projects: Project[] = [
{
  id: 'p-shoprite', name: 'Shoprite Rewards App', client: 'Shoprite Holdings', description: 'Loyalty app redesign and checkout improvements.', billable: true, status: 'active',
  members: ['m-thandi', 'm-sipho', 'm-johan', 'm-lindiwe'], start: '2026-08-03', end: '2026-12-11', hoursWeek: 96.5,
  tasks: [
  { id: 't-checkout', name: 'Checkout redesign', assignees: ['m-thandi', 'm-sipho'], billable: true, status: 'open' },
  { id: 't-research', name: 'User research synthesis', assignees: ['m-thandi'], billable: true, status: 'open' },
  { id: 't-api', name: 'Rewards API integration', assignees: ['m-johan', 'm-sipho'], billable: true, status: 'open' }]

},
{
  id: 'p-website', name: 'Internal Website', description: 'Refresh of mzansiwork.co.za.', billable: false, status: 'active',
  members: ['m-thandi', 'm-lindiwe', 'm-fatima'], start: '2026-09-14', hoursWeek: 31,
  tasks: [
  { id: 't-ia', name: 'Information architecture', assignees: ['m-thandi', 'm-fatima'], billable: false, status: 'open' },
  { id: 't-visual', name: 'Visual design system', assignees: ['m-lindiwe', 'm-thandi'], billable: false, status: 'open' }]

},
{
  id: 'p-onboarding', name: 'Client Onboarding', client: 'Multiple clients', description: 'Onboarding and support for new retainer clients.', billable: true, status: 'active',
  members: ['m-aisha', 'm-zanele', 'm-michael'], hoursWeek: 58,
  tasks: [
  { id: 't-kickoff', name: 'Kick-off workshops', assignees: ['m-aisha', 'm-michael'], billable: true, status: 'open' },
  { id: 't-support', name: 'Support queue', assignees: ['m-zanele'], billable: true, status: 'open' }]

},
{
  id: 'p-infra', name: 'Platform Reliability', description: 'Night support and infrastructure upkeep.', billable: false, status: 'paused',
  members: ['m-ruan', 'm-johan'], hoursWeek: 22,
  tasks: [{ id: 't-oncall', name: 'On-call monitoring', assignees: ['m-ruan'], billable: false, status: 'open' }]
}];