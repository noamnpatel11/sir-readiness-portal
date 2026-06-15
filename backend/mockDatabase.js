// mockDatabase.js
// Permanent read-only database for SIR Readiness Portal

const voterList2002 = [
    // --- PATEL FAMILY (Translated from Kannada 2002 Rolls) ---
    { givenName: "Usman", fatherName: "Chand", familyName: "Patel" }, //
    { givenName: "Khairunnisabegam", fatherName: "Usman", familyName: "Patel" }, //[cite: 3]
    { givenName: "Muneerahmad", fatherName: "Usman", familyName: "Patel" }, //[cite: 3]
    { givenName: "Farzanabegam", fatherName: "Usman", familyName: "Patel" }, //[cite: 3]
    
    // --- INAMDAR FAMILY (Translated from Kannada 2002 Rolls) ---
    { givenName: "Abdul Kadar", fatherName: "Hasimasab", familyName: "Inamdar" }, //
    { givenName: "Maboobi", fatherName: "Abdul Kadar", familyName: "Inamdar" }, //[cite: 2]
    { givenName: "Imtiyaz", fatherName: "Abdul Kadar", familyName: "Inamdar" }, //[cite: 2]
    { givenName: "Asafak", fatherName: "Abdul Kadar", familyName: "Inamdar" }, //[cite: 2]
    { givenName: "Abdularavuph", fatherName: "Mahmadasab", familyName: "Inamdar" }, //[cite: 2]

    // --- KAZI / KHAJI FAMILY (Translated from Kannada 2002 Rolls) ---
    { givenName: "Jafarsadik", fatherName: "Abdulgani", familyName: "Kazi" }, //[cite: 2]
    { givenName: "Khairunnisa", fatherName: "Abdulgani", familyName: "Kazi" }, //[cite: 2]
    { givenName: "Abdulgani", fatherName: "Bashasab", familyName: "Kazi" }, //[cite: 2]
    { givenName: "Shabirahmad", fatherName: "Abdulgani", familyName: "Kazi" }, //[cite: 2]

    // --- KARAJGI / KARAJAGI FAMILY (Translated from Kannada 2002 Rolls) ---
    { givenName: "Mahboobkhadri", fatherName: "Imamoddin", familyName: "Karajgi" }, //[cite: 2]
    { givenName: "Mahmadsalim", fatherName: "Mahboobkhadri", familyName: "Karajgi" }, //[cite: 2]
    { givenName: "Tasavur", fatherName: "Mahmadsalim", familyName: "Karajgi" }, //[cite: 2]
    { givenName: "Mahmadwasem", fatherName: "Mahboobkhadri", familyName: "Karajgi" } //[cite: 2]
];

const voterList2025 = [
    // --- PATEL FAMILY (2025 Rolls) ---
    { givenName: "Hassan", fatherName: "Chand Patel", familyName: "Patel" }, //[cite: 1]
    { givenName: "Afreen", fatherName: "Chand Patel", familyName: "Patel" }, //[cite: 1]
    { givenName: "Tousif", fatherName: "Abdulaziz", familyName: "Patel" }, //[cite: 1]
    { givenName: "Zakeer Husen", fatherName: "Shabuddeen Patel", familyName: "Patel" }, //[cite: 1]
    { givenName: "Ashafaq Ahmad", fatherName: "Gouse Mohiuddin Patel", familyName: "Patel" }, //[cite: 1]
    { givenName: "Abdul Wahab", fatherName: "Gausamoddin", familyName: "Patel" }, //[cite: 1]
    { givenName: "Mohammednoaman", fatherName: "Dastageer", familyName: "Patel Biradar" }, //[cite: 1]

    // --- INAMDAR FAMILY (2025 Rolls) ---
    { givenName: "Fazalunnisa", fatherName: "Basheer Ahmed", familyName: "Inamdar" }, //[cite: 1]
    { givenName: "Farooq Hussain", fatherName: "Basheer Ahmed", familyName: "Inamdar" }, //[cite: 1]
    { givenName: "Mazhar Husain", fatherName: "Basheer Ahmed", familyName: "Inamdar" }, //[cite: 1]
    { givenName: "Salyadbasha", fatherName: "Iqbalsab", familyName: "Inamdar" }, //[cite: 1]
    { givenName: "Mustafa", fatherName: "Mahammad Shareef", familyName: "Inamdar" }, //[cite: 1]

    // --- KAZI / KHAJI FAMILY (2025 Rolls) ---
    { givenName: "Sufiya", fatherName: "Syed Ismail", familyName: "Kazi" }, //[cite: 1]
    { givenName: "Azeem", fatherName: "Abdul Rasheed", familyName: "Kazi" }, //[cite: 1]
    { givenName: "Sameer", fatherName: "Abdul Rasheed", familyName: "Kazi" }, //[cite: 1]
    { givenName: "Noushad", fatherName: "Jabbar Kazi", familyName: "Kazi" }, //[cite: 1]
    { givenName: "Abdulgani", fatherName: "Bashasab", familyName: "Khaji" }, //[cite: 1]

    // --- KARAJGI / KARAJAGI FAMILY (2025 Rolls) ---
    { givenName: "Mudasar", fatherName: "Isakadri", familyName: "Karajagi" }, //[cite: 1]
    { givenName: "Abdut Tawwab", fatherName: "Saleem Karajagi", familyName: "Karajagi" }, //[cite: 1]
    { givenName: "Jinnathapasha", fatherName: "Ahmadasab", familyName: "Karajagi" }, //[cite: 1]
    { givenName: "Tajuddin", fatherName: "Ismayilasab", familyName: "Karajagi" }, //[cite: 1]
    { givenName: "Nuzhat Asma", fatherName: "Tajuddin", familyName: "Karajgi" }, //[cite: 1]
    { givenName: "Tauqeerahamad", fatherName: "Jeened Pasha", familyName: "Karajgi" } //[cite: 1]
];

module.exports = { voterList2002, voterList2025 };