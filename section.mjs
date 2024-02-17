import { count, time } from 'console';
import fs from 'fs';

export class Section {
    constructor(subject, number, name, sectionid, crn, room, days, time) {
        this.subject = subject;
        this.number = number;
        this.name = name;
        this.sectionid = sectionid;
        this.crn = crn;
        this.room = room;
        this.schedule = []; //Contains timeframe
        this.addSchedule(days, time.split(' ')[0], time.split(' ')[1]);
    }

    toString() {
        return `${this.subject} ${this.number} ${this.sectionid}`;
    }

    static load(dataFile) {
        var sectionsData = fs.readFileSync(dataFile, { encoding: 'utf-8' }).split('\n');
        var allSections = [];
        var section;
        var offering, previous

        for (const line of sectionsData) {
            const result = Section.parse(line, offering, previous, section);
            if (result) {
                section = result.section;
                offering = result.offering;
                previous = result.previous;
                allSections.push(section);
            }
        }

        return allSections;
    }

    static parse(line, offering, previous, prevSection) {
        let sectionid = line.slice(38,41);
        let days = line.slice(52,66).replace(/\s/g, "");
        if( /\d\d\d/.test(sectionid) ){
            previous=offering

            offering = {
                subject: line.slice(0,4).trim(),
                number: line.slice(5,9),
                name: line.slice(10,37),
                sectionid: line.slice(38,41),
                crn: line.slice(42,47),
                room: line.slice(80,84),
                days: line.slice(52,66).replace(/\s/g, ""),
                times: line.slice(67,76)
            }
            if (! /\S/.test(offering.subject) ){ // same course 
                offering.subject = previous.subject
                offering.name = previous.name
                offering.number =  previous.number
            }
            return {
                section: new Section(offering.subject, offering.number, offering.name, offering.sectionid,
                offering.crn, offering.room, offering.days, offering.times),
                offering: offering,
                previous: previous
            };
        }
        if( /^[MWTRF]*$/.test(days)){ //Add to schedule
            var time = line.slice(67,76);
            prevSection.addSchedule(days, time.split(' ')[0], time.split(' ')[1]);
        }
        
    }

    addSchedule(daycodes, start, end){
        var _schedule = [daycodes, start, end];
        this.schedule.push(_schedule);
    }

    match(subject, number, sectionid) {
        return this.subject === subject && this.number === number && this.sectionid === sectionid;
    }

    findDayConflicts(days, anotherdays){
        for (const char of days) {
            if (anotherdays.includes(char)){
                return true;
            }
        }
        return false;
    }

    findTimeConflicts(startA, endA, startB, endB){
        var a = parseInt(startA, 10);;
        var b = parseInt(endA, 10);;
        var c = parseInt(startB, 10);;
        var d = parseInt(endB, 10);;

        var conflict = false;
        conflict = conflict || (a<c && b>=c && b<d);
        conflict = conflict || (a<d && b>d);
        conflict = conflict || (a>=c && a<d && b<d);
        conflict = conflict || (a<c && b>d);
        conflict = conflict || (a==c && b==d);

        return conflict;
    }

    conflictsWith(anotherSection) {
        for (let a = 0; a < this.schedule.length; a++) {
            var timeframe = this.schedule[a];
            for (let b = 0; b < anotherSection.schedule.length; b++) {
                var anotherTimeframe = anotherSection.schedule[b];
                if(this.findDayConflicts(timeframe[0], anotherTimeframe[0])){
                    if(this.findTimeConflicts(timeframe[1], timeframe[2], anotherTimeframe[1], anotherTimeframe[2])){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    
}

export default Section;
