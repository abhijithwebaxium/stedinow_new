import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Card, Typography, Avatar, Chip, alpha, useTheme, Stack } from '@mui/material';
import { 
  Person as PersonIcon, 
  School as SchoolIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const KanbanBoard = ({ students, onStageChange }) => {
  const theme = useTheme();

  // Define columns based on the core application workflow stages
  const columns = {
    'Application Submission': students.filter(s => s.currentStage === 'Application Submission'),
    'Offer Management': students.filter(s => s.currentStage === 'Offer Management'),
    'Financial Arrangements': students.filter(s => s.currentStage === 'Financial Arrangements'),
    'Visa Processing': students.filter(s => s.currentStage === 'Visa Processing'),
    'Pre-Departure Readiness': students.filter(s => s.currentStage === 'Pre-Departure Readiness'),
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    onStageChange(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ 
        display: 'flex', 
        gap: 2.5, 
        overflowX: 'auto', 
        pb: 3, 
        minHeight: '70vh',
        '::-webkit-scrollbar': { height: 8 },
        '::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 4 },
      }}>
        {Object.entries(columns).map(([stage, stageStudents]) => (
          <Box key={stage} sx={{ minWidth: 320, maxWidth: 320 }}>
            {/* Column Header */}
            <Box sx={{ 
              mb: 3, 
              p: 2.5, 
              bgcolor: alpha(theme.palette.background.paper, 0.5), 
              borderRadius: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', fontSize: '0.75rem' }}>
                {stage}
              </Typography>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: '10px', 
                fontSize: '0.75rem', 
                fontWeight: 900 
              }}>
                {stageStudents.length}
              </Box>
            </Box>

            {/* Droppable Area */}
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                    minHeight: 600,
                    borderRadius: 3,
                    p: 1,
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {stageStudents.map((student, index) => (
                    <Draggable key={student._id} draggableId={student._id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            p: 3,
                            mb: 2.5,
                            boxShadow: snapshot.isDragging ? `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}` : '0 4px 12px rgba(0,0,0,0.02)',
                            border: `1px solid ${snapshot.isDragging ? theme.palette.primary.main : alpha(theme.palette.divider, 0.05)}`,
                            '&:hover': { 
                              boxShadow: '0 8px 24px rgba(0,0,0,0.05)', 
                              transform: 'translateY(-4px)',
                              borderColor: alpha(theme.palette.primary.main, 0.2)
                            },
                            borderRadius: '20px',
                            bgcolor: 'background.paper',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'visible'
                          }}
                        >
                          <Stack spacing={2}>
                            {/* Student Info Row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main', 
                                width: 44, 
                                height: 44,
                                borderRadius: '14px',
                                fontSize: '1.2rem'
                              }}>
                                <PersonIcon fontSize="inherit" />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.primary', fontSize: '0.95rem' }}>
                                  {student.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                  {student.studentId}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Status & Meta Chips */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={student.currentStatus} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.65rem', 
                                  fontWeight: 900, 
                                  borderRadius: '6px',
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: 'success.main',
                                  border: 'none'
                                }} 
                              />
                            </Box>

                            {/* Footer / Assignment */}
                            <Box sx={{ 
                              pt: 1.5, 
                              borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}`, 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center' 
                            }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Counselor
                              </Typography>
                              <Typography variant="caption" fontWeight={700} color="primary.main">
                                {student.assigned?.counselor?.name || 'Unassigned'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;
