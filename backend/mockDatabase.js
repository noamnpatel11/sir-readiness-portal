// This simulates the massive government databases. 
// I added "noaman" here so we can successfully test a match!

const voterList2002 = [
    { givenName: "noaman", fatherName: "dastageer", familyName: "patel" },
    { givenName: "rahul", fatherName: "rajesh", familyName: "sharma" },
    { givenName: "priya", fatherName: "suresh", familyName: "gupta" }
];

const voterList2025 = [
    { givenName: "naoman", fatherName: "dastagir", familyName: "patel" }, // Notice the typos here!
    { givenName: "amit", fatherName: "anil", familyName: "kumar" }
];

// This makes the lists available for your server.js file to use
module.exports = { voterList2002, voterList2025 };