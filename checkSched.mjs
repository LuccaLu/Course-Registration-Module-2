import { Section } from './section.mjs'
import promptSync from 'prompt-sync'

const prompt = promptSync()

var allSections = Section.load("registrarCleaned2.txt")
var studentSections = []
var stop = false

console.log("%d sections loaded", allSections.length)

do {
    let uInput = prompt( "Enter a course subject number and section: ")

    if(uInput.toLowerCase() == "quit"){
        console.log(`Courses chosen are: ${studentSections}`)
        process.exit(0)
    }

    let pattern = /^\s*(\w+)\s+(\d\d\d\d)\s+(\d\d\d)\s*$/
    let matched = pattern.exec(uInput)
    if(! matched){
        console.log("Bad Input: should be something like this => BIOL 1001 001")
        continue
    }

    let subject = matched[1], number = matched[2], section = matched[3]

    let foundCourse = null
    for (let s of allSections ){ // Slow sequential search
        if( s.match( subject, number, section) ){
            foundCourse = s
            break
        }
    }
    if( !foundCourse ){
        console.log(`Specified section not found. ${subject} ${number} ${section}`)
        continue
    }

    for(let other of studentSections){
        if( other.conflictsWith(foundCourse) )
             console.log(`${foundCourse} conflicts with ${other}`)
        else
            console.log(`${foundCourse} does not conflict with ${other}`)
    }

    studentSections.push(foundCourse)

} while ( ! stop )
