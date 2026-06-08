require("dotenv").config();
const mongoose = require("mongoose");
const Patient = require("./models/Patient");
const Medicine = require("./models/Medicine");
const { BloodStock, BloodDonor, BloodRequest } = require("./models/Blood");
const Appointment = require("./models/Appointment");

const patients = [
  { id:"P001", name:"Ravi Kumar",    age:45, gender:"Male",   blood:"O+",  doctor:"Dr. John Smith",    room:"101", phone:"9876543210", address:"12, MG Road, Bangalore",       diagnosis:"Hypertension",      status:"Admitted",   date:"2025-06-01", fees:1500 },
  { id:"P002", name:"Sneha Patel",   age:32, gender:"Female", blood:"B+",  doctor:"Dr. Emily Johnson", room:"205", phone:"9123456789", address:"45, Park Street, Mumbai",       diagnosis:"Diabetes Type 2",   status:"Admitted",   date:"2025-06-03", fees:2000 },
  { id:"P003", name:"Arjun Singh",   age:60, gender:"Male",   blood:"A-",  doctor:"Dr. David Wilson",  room:"OPD", phone:"9988776655", address:"78, Civil Lines, Delhi",         diagnosis:"Migraine",          status:"Discharged", date:"2025-05-28", fees:800  },
  { id:"P004", name:"Meena Rao",     age:27, gender:"Female", blood:"AB+", doctor:"Dr. Sophia Brown",  room:"310", phone:"9765432100", address:"22, Jubilee Hills, Hyderabad",   diagnosis:"Fracture Left Arm", status:"Admitted",   date:"2025-06-05", fees:5000 },
  { id:"P005", name:"Kiran Bose",    age:52, gender:"Male",   blood:"O-",  doctor:"Dr. John Smith",    room:"112", phone:"9871234560", address:"33, Lake View, Kolkata",         diagnosis:"Chest Pain",        status:"Admitted",   date:"2025-06-06", fees:3200 },
  { id:"P006", name:"Priya Nair",    age:29, gender:"Female", blood:"A+",  doctor:"Dr. Emily Johnson", room:"OPD", phone:"9654321087", address:"5, Anna Nagar, Chennai",         diagnosis:"Viral Fever",       status:"Discharged", date:"2025-06-02", fees:600  },
  { id:"P007", name:"Rohit Das",     age:38, gender:"Male",   blood:"B-",  doctor:"Dr. David Wilson",  room:"204", phone:"9512345678", address:"88, Sector 14, Noida",           diagnosis:"Appendicitis",      status:"Admitted",   date:"2025-06-07", fees:8500 },
  { id:"P008", name:"Anjali Mehta",  age:44, gender:"Female", blood:"AB-", doctor:"Dr. Sophia Brown",  room:"302", phone:"9345678901", address:"14, Linking Road, Pune",         diagnosis:"Knee Replacement",  status:"Admitted",   date:"2025-06-04", fees:12000},
  { id:"P009", name:"Vikram Joshi",  age:67, gender:"Male",   blood:"O+",  doctor:"Dr. John Smith",    room:"ICU", phone:"9234567890", address:"21, Marine Drive, Mumbai",       diagnosis:"Cardiac Arrest",    status:"Admitted",   date:"2025-06-07", fees:25000},
  { id:"P010", name:"Sunita Sharma", age:35, gender:"Female", blood:"B+",  doctor:"Dr. Emily Johnson", room:"OPD", phone:"9123450987", address:"67, Civil Lines, Jaipur",        diagnosis:"Asthma",            status:"Discharged", date:"2025-06-01", fees:900  },
];

const medicines = [
  { id:"MED001", name:"Paracetamol 500mg",   category:"Analgesic",     stock:250, price:5,   expiry:"2026-12-01", supplier:"MedCorp"   },
  { id:"MED002", name:"Amoxicillin 250mg",   category:"Antibiotic",    stock:80,  price:12,  expiry:"2025-08-15", supplier:"PharmaCo"  },
  { id:"MED003", name:"Metformin 500mg",     category:"Antidiabetic",  stock:15,  price:8,   expiry:"2026-03-20", supplier:"HealthPlus"},
  { id:"MED004", name:"Atorvastatin 10mg",   category:"Cardiac",       stock:0,   price:25,  expiry:"2025-11-10", supplier:"MedCorp"   },
  { id:"MED005", name:"Omeprazole 20mg",     category:"Antacid",       stock:180, price:15,  expiry:"2026-06-30", supplier:"PharmaCo"  },
  { id:"MED006", name:"Ibuprofen 400mg",     category:"Analgesic",     stock:320, price:7,   expiry:"2026-09-01", supplier:"MedCorp"   },
  { id:"MED007", name:"Azithromycin 500mg",  category:"Antibiotic",    stock:60,  price:35,  expiry:"2025-12-31", supplier:"HealthPlus"},
  { id:"MED008", name:"Cetirizine 10mg",     category:"Antihistamine", stock:10,  price:4,   expiry:"2026-01-15", supplier:"PharmaCo"  },
  { id:"MED009", name:"Vitamin C 500mg",     category:"Vitamin",       stock:500, price:3,   expiry:"2027-01-01", supplier:"VitaSupply"},
  { id:"MED010", name:"Insulin 100IU",       category:"Antidiabetic",  stock:0,   price:180, expiry:"2025-10-01", supplier:"MedCorp"   },
];

const bloodStocks = [
  { group:"A+",  units:45, lastUpdated:"2025-06-01" },
  { group:"A-",  units:12, lastUpdated:"2025-06-01" },
  { group:"B+",  units:30, lastUpdated:"2025-06-02" },
  { group:"B-",  units:5,  lastUpdated:"2025-05-30" },
  { group:"AB+", units:18, lastUpdated:"2025-06-02" },
  { group:"AB-", units:3,  lastUpdated:"2025-05-29" },
  { group:"O+",  units:60, lastUpdated:"2025-06-02" },
  { group:"O-",  units:8,  lastUpdated:"2025-06-01" },
];

const donors = [
  { group:"O+",  donorName:"Ramesh Kumar",  units:2, donorAge:30, contact:"9876543210", date:"2025-06-01" },
  { group:"A+",  donorName:"Sita Devi",     units:1, donorAge:25, contact:"9123456789", date:"2025-06-02" },
  { group:"B+",  donorName:"Mahesh Babu",   units:2, donorAge:35, contact:"9988776655", date:"2025-06-02" },
  { group:"AB+", donorName:"Kavitha R",     units:1, donorAge:28, contact:"9765432100", date:"2025-06-03" },
  { group:"O-",  donorName:"Suresh Menon",  units:2, donorAge:40, contact:"9871234560", date:"2025-06-04" },
];

const bloodRequests = [
  { patientName:"Vikram Joshi",  group:"O+",  units:2, doctor:"Dr. John Smith",   ward:"ICU", priority:"emergency", status:"Pending"   },
  { patientName:"Meena Rao",     group:"AB+", units:1, doctor:"Dr. Sophia Brown", ward:"310", priority:"urgent",    status:"Fulfilled" },
  { patientName:"Kiran Bose",    group:"O-",  units:2, doctor:"Dr. John Smith",   ward:"112", priority:"urgent",    status:"Pending"   },
  { patientName:"Arjun Singh",   group:"A-",  units:1, doctor:"Dr. David Wilson", ward:"OPD", priority:"normal",    status:"Fulfilled" },
];

const appointments = [
  { patient:"Rohit Das",     doctor:"Dr. John Smith",    dept:"Cardiology",   date:"2025-06-08", time:"09:00 AM", status:"Scheduled" },
  { patient:"Priya Nair",    doctor:"Dr. Emily Johnson", dept:"Pediatrics",   date:"2025-06-08", time:"10:30 AM", status:"Scheduled" },
  { patient:"Suresh Rao",    doctor:"Dr. David Wilson",  dept:"Neurology",    date:"2025-06-08", time:"11:00 AM", status:"Scheduled" },
  { patient:"Anjali Mehta",  doctor:"Dr. Sophia Brown",  dept:"Orthopedics",  date:"2025-06-08", time:"02:00 PM", status:"Completed" },
  { patient:"Vikram Joshi",  doctor:"Dr. John Smith",    dept:"Cardiology",   date:"2025-06-08", time:"03:30 PM", status:"Scheduled" },
  { patient:"Sunita Sharma", doctor:"Dr. Emily Johnson", dept:"Pediatrics",   date:"2025-06-09", time:"09:30 AM", status:"Scheduled" },
  { patient:"Ravi Kumar",    doctor:"Dr. John Smith",    dept:"Cardiology",   date:"2025-06-09", time:"11:00 AM", status:"Scheduled" },
  { patient:"Sneha Patel",   doctor:"Dr. Emily Johnson", dept:"Pediatrics",   date:"2025-06-09", time:"02:30 PM", status:"Cancelled" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  // Clear existing
  await Promise.all([
    Patient.deleteMany({}),
    Medicine.deleteMany({}),
    BloodStock.deleteMany({}),
    BloodDonor.deleteMany({}),
    BloodRequest.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // Insert patients
  await Patient.insertMany(patients);
  console.log(`✅ Inserted ${patients.length} patients`);

  // Insert medicines (use save to trigger pre-save hook for status)
  for (const m of medicines) {
    await new Medicine(m).save();
  }
  console.log(`✅ Inserted ${medicines.length} medicines`);

  // Insert blood stocks (use save for status hook)
  for (const b of bloodStocks) {
    await new BloodStock(b).save();
  }
  console.log(`✅ Inserted ${bloodStocks.length} blood stock records`);

  await BloodDonor.insertMany(donors);
  console.log(`✅ Inserted ${donors.length} donors`);

  await BloodRequest.insertMany(bloodRequests);
  console.log(`✅ Inserted ${bloodRequests.length} blood requests`);

  await Appointment.insertMany(appointments);
  console.log(`✅ Inserted ${appointments.length} appointments`);

  console.log("\n🎉 All dummy data seeded successfully!");
  console.log("   Patients     :", patients.length);
  console.log("   Medicines    :", medicines.length);
  console.log("   Blood Stocks :", bloodStocks.length);
  console.log("   Donors       :", donors.length);
  console.log("   Requests     :", bloodRequests.length);
  console.log("   Appointments :", appointments.length);

  process.exit(0);
}

seed().catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1); });
