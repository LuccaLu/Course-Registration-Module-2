import express from 'express';

import { Section } from './section.mjs'; 

const app = express();
const port = 8820;

app.use(express.json());

let allSections = Section.load("registrarCleaned.txt");

app.get('/section', (req, res) => {
    const { subject, number, name, section, crn, room, schedule } = req.query;

    if (!subject || subject === 'null' || subject.trim() === '' ||
        !number || number === 'null' || number.trim() === '' ||
        !section || section === 'null' || section.trim() === '') {
        return res.status(400).json('Subject, number, and section cannot be empty or null.');
    }

    if (!/^\d{4}$/.test(number) || !/^\d{3}$/.test(section)) {
        return res.status(400).send('Number must be exactly 4 digits and section must be exactly 3 digits, both numeric.');
    }

    const foundSection = allSections.find(s =>
        (!name || s.name === name) &&
        (!crn || s.crn === crn) &&
        (!room || s.room === room) &&
        (!schedule || s.schedule === schedule) &&
        s.subject.toUpperCase() === subject.toUpperCase() &&
        s.number === number &&
        s.sectionid === section
    );

    if (foundSection) {
        const response = {
            subject: foundSection.subject,
            number: foundSection.number,
            name: foundSection.name || "N/A",
            sectionid: foundSection.section, 
            crn: foundSection.crn || "N/A",
            room: foundSection.room || "N/A",
            schedule: foundSection.schedule || [["N/A", "N/A", "N/A"]]
        };
        res.json(response);
    } else {
        res.status(404).json('Not Found');
    }
});


app.get('/list/:subject', (req, res) => {
    const subject = req.params.subject;
    const { number, sectionid } = req.query;

    const filteredSections = allSections.filter(s =>
        s.subject.toUpperCase() === subject.toUpperCase() &&
        (!number || s.number === number) &&
        (!sectionid || s.sectionid === sectionid)
    );

    if (filteredSections.length > 0) {
        const formattedSections = filteredSections.map(s => ({
            subject: s.subject,
            number: s.number,
            name: s.name,
            sectionid: s.sectionid,
            crn: s.crn,
            room: s.room,
            schedule: s.schedule
        }));
        res.json(formattedSections);
    } else {
        res.status(404).send('Not Found');
    }
});


app.post('/section', (req, res) => {
    const { subject, number, section} = req.body;

    if (!subject || subject === 'null' || subject.trim() === '' ||
        !number || number === 'null' || number.trim() === '' ||
        !section || section === 'null' || section.trim() === '') {
        return res.status(400).json('Subject, number, and section cannot be empty or null.');
    }

    if (!/^\d{4}$/.test(number) || !/^\d{3}$/.test(section)) {
        return res.status(400).json('Number must be exactly 4 digits and section must be exactly 3 digits, both numeric.');
    }

    const newSection = {
        subject,
        number,
        section
    };

    allSections.push(newSection);

    res.status(201).json(newSection);
});


app.get('/checkconflict', (req, res) => {
    const { subject1, number1, section1, subject2, number2, section2 } = req.query;

    const sectionOne = allSections.find(s => 
        s.subject.toUpperCase() === subject1.toUpperCase() &&
        s.number === number1 &&
        s.sectionid === section1);

    const sectionTwo = allSections.find(s => 
        s.subject.toUpperCase() === subject2.toUpperCase() &&
        s.number === number2 &&
        s.sectionid === section2);

    if (!sectionOne || !sectionTwo) {
        return res.status(404).json('One or both of the specified sections do not exist.');
    }

    const conflictFound = sectionOne.conflictsWith(sectionTwo);

    if (conflictFound) {
        res.json('conflict found' );
    } else {
        res.json('no conflict found');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
