import Student from '../models/Student.js';
import User from '../models/user.js';

// EOD Report - End of Day Report
export const getEODReport = async (req, res, next) => {
  try {
    const { staffMember, dateFrom, dateTo } = req.query;

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    // Build query
    const query = {
      updatedAt: { $gte: startDate, $lte: endDate },
    };

    if (staffMember) {
      query.assignedCounselor = staffMember;
    }

    // Get all students updated in this period
    const students = await Student.find(query)
      .populate('assignedCounselor', 'name email')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });

    // Collect activities
    const activities = [];

    students.forEach(student => {
      // Student creation
      if (student.createdAt >= startDate && student.createdAt <= endDate) {
        activities.push({
          timestamp: student.createdAt,
          type: 'Student Registration',
          studentName: student.name,
          studentId: student.studentId,
          details: `New student registered`,
          status: 'Completed',
        });
      }

      // Followup history
      if (student.followup?.followupHistory) {
        student.followup.followupHistory.forEach(followup => {
          const followupDate = new Date(followup.date);
          if (followupDate >= startDate && followupDate <= endDate) {
            activities.push({
              timestamp: followupDate,
              type: 'Followup',
              studentName: student.name,
              studentId: student.studentId,
              details: followup.notes || 'Followup completed',
              status: 'Completed',
            });
          }
        });
      }

      // Status changes from journey tracking
      if (student.journeyTracking) {
        student.journeyTracking.forEach(track => {
          const trackDate = new Date(track.timestamp);
          if (trackDate >= startDate && trackDate <= endDate) {
            activities.push({
              timestamp: trackDate,
              type: 'Status Update',
              studentName: student.name,
              studentId: student.studentId,
              details: `Moved to ${track.stage} - ${track.status}`,
              status: 'Completed',
            });
          }
        });
      }
    });

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate summary
    const summary = {
      totalActivities: activities.length,
      studentsContacted: new Set(activities.map(a => a.studentId)).size,
      followupsDone: activities.filter(a => a.type === 'Followup').length,
      documentsProcessed: 0, // Can be enhanced based on document upload tracking
    };

    res.status(200).json({
      status: 'success',
      data: {
        summary,
        activities,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        staffMember: staffMember || 'All Staff',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Counselor Performance Report
export const getCounselorReport = async (req, res, next) => {
  try {
    const { staffMember, dateFrom, dateTo } = req.query;

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    // Build query
    const query = {};
    if (staffMember) {
      query.assignedCounselor = staffMember;
    }

    const students = await Student.find(query)
      .populate('assignedCounselor', 'name email role');

    // Filter students created in date range
    const studentsInRange = students.filter(s =>
      new Date(s.createdAt) >= startDate && new Date(s.createdAt) <= endDate
    );

    // Calculate stats
    const totalStudents = students.length;
    const conversions = students.filter(s => s.currentStatus === 'Converted').length;
    const conversionRate = totalStudents > 0 ? Math.round((conversions / totalStudents) * 100) : 0;

    // Phase breakdown
    const phaseBreakdown = {};
    students.forEach(s => {
      if (s.currentPhase) {
        phaseBreakdown[s.currentPhase] = (phaseBreakdown[s.currentPhase] || 0) + 1;
      }
    });

    // Recent activities
    const recentActivities = [];
    studentsInRange.slice(0, 10).forEach(student => {
      if (student.followup?.followupHistory && student.followup.followupHistory.length > 0) {
        const lastFollowup = student.followup.followupHistory[student.followup.followupHistory.length - 1];
        recentActivities.push({
          type: 'Followup',
          studentName: student.name,
          timestamp: lastFollowup.date,
          details: lastFollowup.notes,
        });
      }
    });

    // Calculate average response time (simplified - can be enhanced)
    const avgResponseTime = 24; // Default 24 hours

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          conversions,
          conversionRate,
          avgResponseTime,
        },
        phaseBreakdown,
        recentActivities: recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Phase Report
export const getPhaseReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    const students = await Student.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Group by phase, stage, and status
    const phaseMap = {};
    students.forEach(student => {
      const key = `${student.currentPhase}|${student.currentStage}|${student.currentStatus}`;
      if (!phaseMap[key]) {
        phaseMap[key] = {
          phase: student.currentPhase,
          stage: student.currentStage,
          status: student.currentStatus,
          count: 0,
        };
      }
      phaseMap[key].count++;
    });

    const phaseData = Object.values(phaseMap).map(item => ({
      ...item,
      percentage: students.length > 0 ? Math.round((item.count / students.length) * 100) : 0,
    }));

    // Sort by count descending
    phaseData.sort((a, b) => b.count - a.count);

    res.status(200).json({
      status: 'success',
      data: {
        phaseData,
        totalStudents: students.length,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Conversion Report
export const getConversionReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    const students = await Student.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate conversion funnel
    const totalLeads = students.filter(s => s.currentPhase === 'Lead Acquisition').length;
    const qualified = students.filter(s =>
      s.currentPhase !== 'Lead Acquisition' ||
      s.currentStatus === 'Qualified Lead'
    ).length;
    const converted = students.filter(s => s.currentStatus === 'Converted').length;
    const enrolled = students.filter(s =>
      s.currentPhase === 'Student Onboarding' ||
      s.currentPhase === 'Visa Preparation' ||
      s.currentPhase === 'Post-Arrival Support'
    ).length;

    const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

    const funnelData = [
      {
        name: 'Total Leads',
        count: totalLeads,
        percentage: 100,
        color: theme => theme.palette.error.main,
      },
      {
        name: 'Qualified Leads',
        count: qualified,
        percentage: totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0,
        color: theme => theme.palette.warning.main,
      },
      {
        name: 'Converted',
        count: converted,
        percentage: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0,
        color: theme => theme.palette.info.main,
      },
      {
        name: 'Enrolled',
        count: enrolled,
        percentage: totalLeads > 0 ? Math.round((enrolled / totalLeads) * 100) : 0,
        color: theme => theme.palette.success.main,
      },
    ];

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalLeads: totalLeads || students.length,
          converted,
          conversionRate,
        },
        funnelData,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Application Report
export const getApplicationReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, staffMember } = req.query;

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    const query = {
      currentPhase: 'Student Onboarding',
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (staffMember) {
      query.assignedCounselor = staffMember;
    }

    const students = await Student.find(query)
      .populate('assignedCounselor', 'name email')
      .sort({ updatedAt: -1 });

    // Application status breakdown
    const statusBreakdown = {
      'Application on Progress': 0,
      'Application Submitted': 0,
      'Conditional offer letter received': 0,
      'Unconditional offer letter received': 0,
      'Offer Accepted': 0,
      'Offer Declined': 0,
      'Enrollment Confirmed': 0,
      'Plan Drop': 0,
    };

    const applicationsList = [];

    students.forEach(student => {
      // Count by status
      if (statusBreakdown[student.currentStatus] !== undefined) {
        statusBreakdown[student.currentStatus]++;
      }

      // Build application details
      applicationsList.push({
        studentId: student.studentId,
        studentName: student.name,
        email: student.email,
        phone: `${student.phoneCode} ${student.phone}`,
        currentStage: student.currentStage,
        currentStatus: student.currentStatus,
        assignedCounselor: student.assignedCounselor?.name || 'Unassigned',
        lastUpdated: student.updatedAt,
        createdAt: student.createdAt,
      });
    });

    // Calculate statistics
    const totalApplications = students.length;
    const inProgress = statusBreakdown['Application on Progress'];
    const submitted = statusBreakdown['Application Submitted'];
    const offersReceived = statusBreakdown['Conditional offer letter received'] +
                           statusBreakdown['Unconditional offer letter received'];
    const accepted = statusBreakdown['Offer Accepted'];
    const enrolled = statusBreakdown['Enrollment Confirmed'];
    const dropped = statusBreakdown['Plan Drop'];

    const successRate = totalApplications > 0
      ? Math.round(((accepted + enrolled) / totalApplications) * 100)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalApplications,
          inProgress,
          submitted,
          offersReceived,
          accepted,
          enrolled,
          dropped,
          successRate,
        },
        statusBreakdown,
        applicationsList,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Visa Report
export const getVisaReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, staffMember } = req.query;

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    const query = {
      currentPhase: 'Visa Preparation',
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (staffMember) {
      query.assignedCounselor = staffMember;
    }

    const students = await Student.find(query)
      .populate('assignedCounselor', 'name email')
      .sort({ updatedAt: -1 });

    // Visa status breakdown
    const visaStatusBreakdown = {
      'Visa Application In Progress': 0,
      'Visa Application Submitted': 0,
      'Visa Application Rejected': 0,
      'Visa Application Re-Submitted': 0,
      'Visa Approved': 0,
    };

    const visaList = [];

    students.forEach(student => {
      // Count by visa status
      if (visaStatusBreakdown[student.currentStatus] !== undefined) {
        visaStatusBreakdown[student.currentStatus]++;
      }

      // Build visa details
      visaList.push({
        studentId: student.studentId,
        studentName: student.name,
        email: student.email,
        phone: `${student.phoneCode} ${student.phone}`,
        currentStage: student.currentStage,
        currentStatus: student.currentStatus,
        assignedCounselor: student.assignedCounselor?.name || 'Unassigned',
        lastUpdated: student.updatedAt,
        createdAt: student.createdAt,
      });
    });

    // Calculate statistics
    const totalVisaApplications = students.length;
    const inProgress = visaStatusBreakdown['Visa Application In Progress'];
    const submitted = visaStatusBreakdown['Visa Application Submitted'];
    const approved = visaStatusBreakdown['Visa Approved'];
    const rejected = visaStatusBreakdown['Visa Application Rejected'];
    const resubmitted = visaStatusBreakdown['Visa Application Re-Submitted'];

    const approvalRate = totalVisaApplications > 0
      ? Math.round((approved / totalVisaApplications) * 100)
      : 0;

    const rejectionRate = totalVisaApplications > 0
      ? Math.round((rejected / totalVisaApplications) * 100)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalVisaApplications,
          inProgress,
          submitted,
          approved,
          rejected,
          resubmitted,
          approvalRate,
          rejectionRate,
        },
        visaStatusBreakdown,
        visaList,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
