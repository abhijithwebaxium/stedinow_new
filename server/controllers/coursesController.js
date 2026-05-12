import Course from '../models/course.js';
import University from '../models/university.js';
import Country from '../models/country.js';
import XLSX from 'xlsx';
import fs from 'fs';

// Get all courses (optionally filtered by university)
export const getAllCourses = async (req, res, next) => {
  try {
    const { university, country, search } = req.query;

    const query = { isActive: true };

    if (university) {
      query.university = university;
    }

    let courses = await Course.find(query)
      .populate({
        path: 'university',
        select: 'name country city',
        populate: {
          path: 'country',
          select: 'name code',
        },
      })
      .sort({ name: 1 })
      .limit(1000); // Limit for performance

    // Filter by country if provided
    if (country) {
      courses = courses.filter(course =>
        course.university &&
        course.university.country &&
        course.university.country.name === country
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(course =>
        course.name.toLowerCase().includes(searchLower) ||
        (course.university && course.university.name.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({ status: 'success', courses, total: courses.length });
  } catch (err) {
    next(err);
  }
};

// Get single course
export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate({
        path: 'university',
        select: 'name country city',
        populate: {
          path: 'country',
          select: 'name code',
        },
      });

    if (!course) throw new Error('Course not found');

    res.status(200).json({ status: 'success', course });
  } catch (err) {
    next(err);
  }
};

// Delete single course
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) throw new Error('Course not found');

    await Course.deleteOne({ _id: id });

    res.status(200).json({ status: 'success', message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete all courses
export const deleteAllCourses = async (req, res, next) => {
  try {
    const result = await Course.deleteMany({});

    res.status(200).json({
      status: 'success',
      message: `Deleted ${result.deletedCount} courses successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    next(err);
  }
};

// Upload courses from Excel file
export const uploadCourses = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const filePath = req.file.path;

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      sheetsProcessed: 0,
      totalSheets: workbook.SheetNames.length,
    };

    // Process ALL sheets in the workbook
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        console.log(`Sheet "${sheetName}" is empty, skipping...`);
        continue;
      }

      results.sheetsProcessed++;

      // Process each row in the current sheet
      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          // Extract data from Excel columns
          const universityName = row['University']?.toString().trim();
          const programName = row['Program Name']?.toString().trim();
          const campus = row['Campus']?.toString().trim();
          const countryName = row['Country']?.toString().trim();
          const intakeMonthRaw = row['Intake Month']?.toString().trim();

          // Split intake months by comma and clean them up
          const intakeMonths = intakeMonthRaw
            ? intakeMonthRaw.split(',').map(month => month.trim()).filter(month => month)
            : [];

          // Validate required fields
          if (!universityName || !programName || !countryName) {
            results.failed++;
            results.errors.push({
              sheet: sheetName,
              row: i + 2, // Excel row (1-indexed + header)
              error: 'Missing required fields (University, Program Name, or Country)',
              data: row,
            });
            continue;
          }

          // Find or create country
          let country = await Country.findOne({ name: countryName });
          if (!country) {
            country = await Country.create({
              name: countryName,
              code: countryName.substring(0, 2).toUpperCase(),
              isActive: true,
            });
          }

          // Find or create university (now using country ObjectId)
          let university = await University.findOne({
            name: universityName,
            country: country._id,
          });

          if (!university) {
            university = await University.create({
              name: universityName,
              country: country._id,
              city: campus || '',
              isActive: true,
            });
          }

          // Check if course already exists
          const existingCourse = await Course.findOne({
            name: programName,
            university: university._id,
          });

          if (existingCourse) {
            // Course exists, update intakes if new intake months are provided
            if (intakeMonths.length > 0) {
              for (const month of intakeMonths) {
                if (!existingCourse.intakes.includes(month)) {
                  existingCourse.intakes.push(month);
                }
              }
              await existingCourse.save();
            }
            results.success++;
          } else {
            // Create new course with intake months (no year)
            await Course.create({
              name: programName,
              university: university._id,
              level: 'Postgraduate', // Default, can be enhanced
              intakes: intakeMonths,
              isActive: true,
            });
            results.success++;
          }
        } catch (rowErr) {
          results.failed++;
          results.errors.push({
            sheet: sheetName,
            row: i + 2,
            error: rowErr.message,
            data: row,
          });
        }
      }
    }

    // Delete the uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      console.error('Failed to delete uploaded file:', unlinkErr);
    }

    res.status(200).json({
      status: 'success',
      message: `Upload completed. ${results.sheetsProcessed} of ${results.totalSheets} sheets processed. ${results.success} courses processed successfully, ${results.failed} failed.`,
      results,
    });
  } catch (err) {
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Failed to delete uploaded file:', unlinkErr);
      }
    }
    next(err);
  }
};
