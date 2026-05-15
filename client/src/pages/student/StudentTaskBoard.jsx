import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Stack, Paper, alpha, useTheme,
  CircularProgress, Chip, IconButton, Tooltip,
} from '@mui/material';
import {
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon,
  PersonOutline as ProfileIcon,
  DescriptionOutlined as DocIcon,
  SchoolOutlined as AppIcon,
  FlightTakeoff as VisaIcon,
  CalendarToday as DeadlineIcon,
  NotificationsNoneOutlined as GeneralIcon,
  ArrowForwardIos as GoIcon,
} from '@mui/icons-material';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const TYPE_CONFIG = {
  profile: { icon: <ProfileIcon sx={{ fontSize: 18 }} />, color: '#3B82F6', label: 'Profile' },
  document: { icon: <DocIcon sx={{ fontSize: 18 }} />, color: '#8B5CF6', label: 'Document' },
  application: { icon: <AppIcon sx={{ fontSize: 18 }} />, color: '#10B981', label: 'Application' },
  visa: { icon: <VisaIcon sx={{ fontSize: 18 }} />, color: '#F59E0B', label: 'Visa' },
  deadline: { icon: <DeadlineIcon sx={{ fontSize: 18 }} />, color: '#EF4444', label: 'Deadline' },
  general: { icon: <GeneralIcon sx={{ fontSize: 18 }} />, color: '#64748b', label: 'General' },
};

const PRIORITY_COLORS = {
  urgent: { bg: alpha('#EF4444', 0.08), text: '#DC2626' },
  high: { bg: alpha('#F59E0B', 0.1), text: '#D97706' },
  medium: { bg: alpha('#3B82F6', 0.08), text: '#2563EB' },
  low: { bg: alpha('#94a3b8', 0.1), text: '#64748b' },
};

// Returns an application context string for task descriptions, e.g. " — required for University of Manchester"
const appContext = (activeApps) => {
  if (!activeApps?.length) return '';
  return activeApps.length === 1
    ? ` — required for ${activeApps[0].university?.name || 'your active application'}`
    : ` — required for ${activeApps.length} active applications`;
};

const buildAutoTasks = (student, documents, applications) => {
  if (!student) return [];
  const tasks = [];
  const addTask = (id, title, description, type, priority, link) =>
    tasks.push({ _id: `auto_${id}`, title, description, type, priority, isAuto: true, link });

  // Applications in Document Collection stage — these make missing docs urgent
  const docCollectionApps = (applications || []).filter(
    a => a.currentStage === 'Document Collection' && !['Rejected', 'Withdrawn'].includes(a.status)
  );
  const hasActiveDocApp = docCollectionApps.length > 0;
  const ctx = appContext(docCollectionApps);

  // Profile tasks
  if (!student.personalInfo?.dob || !student.personalInfo?.nationality || !student.personalInfo?.passportNumber) {
    addTask('profile_basic', 'Complete Your Personal Info',
      `Add your Date of Birth, Nationality, and Passport Number to strengthen your profile${ctx}.`,
      'profile', hasActiveDocApp ? 'high' : 'medium', '/student/profile');
  }
  if (!student.academics?.tenth?.percentage || !student.academics?.twelfth?.percentage) {
    addTask('academics', 'Add Your Academic Scores',
      `Enter your 10th and 12th grade results in the Education tab${ctx}.`,
      'profile', hasActiveDocApp ? 'high' : 'medium', '/student/profile?tab=1');
  }
  if (!student.academics?.ielts?.overallScore && !student.academics?.toefl?.overallScore && !student.academics?.pte?.overallScore) {
    addTask('english', 'Add English Test Score',
      `Add your IELTS, TOEFL, or PTE score — most universities require this${ctx}.`,
      'profile', hasActiveDocApp ? 'high' : 'medium', '/student/profile?tab=1');
  }
  if (!student.personalInfo?.fatherName && !student.personalInfo?.motherName) {
    addTask('family', 'Add Family Contact Details',
      'Your counselor may need family contact info for certain applications.',
      'profile', 'low', '/student/profile?tab=2');
  }
  if (!student.preferences?.targetCountries?.length) {
    addTask('prefs', 'Set Study Preferences',
      'Tell us your preferred countries, study level, and intake to get better guidance.',
      'profile', 'medium', '/student/profile?tab=2');
  }

  // Document tasks — urgency scales with whether an active application is waiting
  const docTypes = (documents || []).map(d => d.documentType);
  if (!docTypes.includes('Passport')) {
    addTask('doc_passport',
      hasActiveDocApp
        ? `Passport Missing${docCollectionApps.length === 1 ? ` — ${docCollectionApps[0].university?.name || 'Active Application'}` : ` — ${docCollectionApps.length} Applications Blocked`}`
        : 'Upload Your Passport',
      `A valid passport copy is required for all university applications${ctx}.`,
      'document', 'urgent', '/student/profile?tab=3');
  }
  if (!docTypes.some(t => ['10th Marksheet', '10th Certificate'].includes(t))) {
    addTask('doc_10th',
      hasActiveDocApp ? `10th Grade Documents Needed${ctx}` : 'Upload 10th Grade Documents',
      `10th marksheet and/or certificate are required for most applications${ctx}.`,
      'document', hasActiveDocApp ? 'urgent' : 'high', '/student/profile?tab=3');
  }
  if (!docTypes.some(t => ['12th Marksheet', '12th Certificate'].includes(t))) {
    addTask('doc_12th',
      hasActiveDocApp ? `12th Grade Documents Needed${ctx}` : 'Upload 12th Grade Documents',
      `12th marksheet and/or certificate are required for most applications${ctx}.`,
      'document', hasActiveDocApp ? 'urgent' : 'high', '/student/profile?tab=3');
  }
  if (!docTypes.includes('Bank Statement')) {
    addTask('doc_bank', 'Upload Bank Statement',
      'Required for visa applications and financial verification.',
      'document', 'medium', '/student/profile?tab=3');
  }

  return tasks;
};

const TaskCard = ({ task, onToggle, completing }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[task.type] || TYPE_CONFIG.general;
  const priorityCfg = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const isDone = task.status === 'completed';

  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date();
  const daysUntilDue = task.dueDate
    ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: '20px',
      border: `1px solid ${isDone ? alpha(theme.palette.divider, 0.06) : isOverdue ? alpha('#EF4444', 0.2) : alpha(theme.palette.divider, 0.08)}`,
      bgcolor: isDone ? '#fafafa' : isOverdue ? alpha('#EF4444', 0.02) : 'white',
      transition: 'all 0.2s',
      opacity: isDone ? 0.7 : 1,
    }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Toggle (only for counselor tasks) */}
        {!task.isAuto ? (
          <Tooltip title={isDone ? 'Mark as pending' : 'Mark as done'}>
            <IconButton
              size="small"
              onClick={() => onToggle(task._id)}
              disabled={completing === task._id}
              sx={{ color: isDone ? '#10B981' : '#cbd5e1', p: 0.3, mt: 0.2, flexShrink: 0 }}
            >
              {completing === task._id
                ? <CircularProgress size={18} />
                : isDone ? <DoneIcon /> : <TodoIcon />}
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(cfg.color, 0.1), color: cfg.color, display: 'flex', flexShrink: 0, mt: 0.1 }}>
            {cfg.icon}
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" gap={0.5} sx={{ mb: 0.5 }}>
            <Typography variant="body2" sx={{
              fontWeight: 800, color: isDone ? '#94a3b8' : '#1e293b', flex: 1, minWidth: 0,
              textDecoration: isDone ? 'line-through' : 'none',
            }}>
              {task.title}
            </Typography>
            <Stack direction="row" spacing={0.5} flexShrink={0}>
              {!isDone && (
                <Chip
                  label={task.priority}
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: priorityCfg.bg, color: priorityCfg.text, '& .MuiChip-label': { px: 0.8 } }}
                />
              )}
              <Chip
                label={cfg.label}
                size="small"
                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha(cfg.color, 0.08), color: cfg.color, '& .MuiChip-label': { px: 0.8 } }}
              />
            </Stack>
          </Stack>

          {task.description && (
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
              {task.description}
            </Typography>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {task.dueDate ? (
              <Typography variant="caption" sx={{ fontWeight: 700, color: isOverdue ? '#EF4444' : daysUntilDue <= 3 ? '#F59E0B' : '#94a3b8' }}>
                {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                  : daysUntilDue === 0 ? 'Due today'
                  : daysUntilDue === 1 ? 'Due tomorrow'
                  : `Due in ${daysUntilDue} days`}
              </Typography>
            ) : (
              task.isAuto ? (
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Suggested action</Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  {isDone ? `Done ${new Date(task.completedAt).toLocaleDateString()}` : 'No due date'}
                </Typography>
              )
            )}

            {task.isAuto && task.link && !isDone && (
              <Chip
                label="Go there"
                size="small"
                icon={<GoIcon sx={{ fontSize: '10px !important' }} />}
                onClick={() => navigate(task.link.split('?')[0], task.link.includes('tab=') ? { state: { initialTab: parseInt(task.link.split('tab=')[1]) } } : undefined)}
                sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer', bgcolor: alpha('#3B82F6', 0.08), color: '#2563EB', '& .MuiChip-label': { px: 0.8 } }}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

const StudentTaskBoard = () => {
  const { student, documents } = useOutletContext();
  const [counselorTasks, setCounselorTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, appsRes] = await Promise.all([
          axios.get(`${API_URL}/api/student-portal/tasks`, { withCredentials: true }),
          axios.get(`${API_URL}/api/student-portal/applications`, { withCredentials: true }),
        ]);
        if (tasksRes.data.status === 'success') setCounselorTasks(tasksRes.data.tasks);
        if (appsRes.data.status === 'success') setApplications(appsRes.data.applications);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const autoTasks = useMemo(
    () => buildAutoTasks(student, documents, applications),
    [student, documents, applications]
  );

  const handleToggle = async (taskId) => {
    setCompleting(taskId);
    try {
      const res = await axios.patch(`${API_URL}/api/student-portal/tasks/${taskId}/complete`, {}, { withCredentials: true });
      if (res.data.status === 'success') {
        setCounselorTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
      }
    } catch (e) { console.error(e); }
    finally { setCompleting(null); }
  };

  const allTasks = useMemo(() => {
    const counselorPending = counselorTasks.filter(t => t.status === 'pending');
    const counselorDone = counselorTasks.filter(t => t.status === 'completed');
    // Auto-tasks are "done" if their target field is now filled (re-derived from student each time)
    // For filter purposes, auto-tasks are always "pending" (they disappear when the underlying condition is met)
    return { pending: [...autoTasks, ...counselorPending], done: counselorDone };
  }, [autoTasks, counselorTasks]);

  const pendingCount = allTasks.pending.length;
  const doneCount = allTasks.done.length;

  const displayed = filter === 'pending' ? allTasks.pending : allTasks.done;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: '"Outfit", sans-serif' }}>
            My Tasks
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, mt: 0.3 }}>
            Actions to complete and deadlines to keep track of.
          </Typography>
        </Box>
        {pendingCount > 0 && (
          <Chip
            label={`${pendingCount} pending`}
            sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#D97706', fontWeight: 800, borderRadius: '12px' }}
          />
        )}
      </Stack>

      {/* Filter tabs */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {[
          { key: 'pending', label: `To Do (${pendingCount})` },
          { key: 'done', label: `Done (${doneCount})` },
        ].map(tab => (
          <Box
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            sx={{
              px: 2.5, py: 1, borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem',
              bgcolor: filter === tab.key ? '#3B82F6' : 'white',
              color: filter === tab.key ? 'white' : '#64748b',
              border: `1px solid ${filter === tab.key ? '#3B82F6' : 'rgba(0,0,0,0.06)'}`,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : displayed.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: '28px', border: `1px solid rgba(0,0,0,0.06)`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 2 }}>
            {filter === 'pending' ? '🎉' : '📋'}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            {filter === 'pending' ? 'All caught up!' : 'No completed tasks yet'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            {filter === 'pending'
              ? 'No pending tasks right now. Great work keeping up!'
              : 'Tasks you complete will appear here.'}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {displayed.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={handleToggle}
              completing={completing}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default StudentTaskBoard;
