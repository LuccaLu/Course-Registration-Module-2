import assert from 'assert'
import supertest from 'supertest'

var request = supertest("http://localhost:8820")

describe('GET /section', function() {
    var tests = [{ args: ["MATH","1000","005"], expected: 200},
                 { args: ["COMP","2008","001"], expected: 200},
                 { args: ["PHYS","2055","001"], expected: 200},
                 { args: ["GEOG","2302","001"], expected: 200},
                 { args: ["PSYC","6000","001"], expected: 200},
                 { args: ["SOCI","6390","001"], expected: 200},
                 { args: ["COMP","1001","003"], expected: 200},
                 { args: ["EASC","2031","001"], expected: 200},
                 { args: ["MATH","1000","001"], expected: 200},
                 { args: ["CRIM","4212","001"], expected: 200},
                 { args: ["COMP","1001","008"], expected: 400},
                 { args: ["EASC","2931","001"], expected: 400},
                 { args: ["MAHT","1000","001"], expected: 400},
                 { args: ["XYXY","4212","001"], expected: 400},
                ];

    tests.forEach(function(test){
        let reqstring=`/section?subject=${test.args[0]}&number=${test.args[1]}&section=${test.args[2]}`;
        it(`GET ${reqstring}`, async function() {
            
            let response = await request.get(reqstring)
            // console.log(response)
            assert(test.expected < response.status + 5 )
            if( response.status == 200 )
                assert.equal(test.args[0], response.body.subject) 
        });
    });
})

describe('POST /section', function() {
    var tests = [{ name: 'attempt1', args: ["CHEM","1000","025"], expected: 201},
                 { name: 'attempt2', args: ["COMP","2777","001"], expected: 201},
                 { name: 'attempt3', args: ["PHYS","2595","001"], expected: 201},
                 { name: 'attempt4', args: ["PLUG","2302","001"], expected: 201},
                 { name: 'attempt5', args: ["PSYC","6000",""], expected: 400},
                 { name: 'attempt6', args: ["SOCI","6390","XXX"], expected: 400},
                 { name: 'attempt7', args: ["COMP","","003"], expected: 400},
                 { name: 'attempt8', args: ["","2031","001"], expected: 400},
                ];

    tests.forEach(function(test){
        it(`POST /section ${test.name}`, async function() {
            
            let response = await request.post('/section')
                                        .send({ subject: test.args[0],
                                                number: test.args[1],
                                                section: test.args[2]
                                            })
                                        .set('Content-Type', 'application/json');   

            assert.equal(test.expected, response.status)
            if( response.status >= 400 ) return

            let reqstring=`/section?subject=${test.args[0]}&number=${test.args[1]}&section=${test.args[2]}`
            response = await request.get(reqstring)
            assert(response.status < 400)
            let section_attr = response.body.section || response.body.sectionid
            assert.equal(test.args[0], response.body.subject)
            assert.equal(test.args[1], response.body.number)
            assert.equal(test.args[2], section_attr)
        });
    });
})

describe('GET /list', function() {
    var tests = [{ name: 'BIOL', count: 83, expect: 200 },
                 { name: 'MATH', count:63, expect: 200 },
                 { name: 'DUMB', count:0, expect: 404}]
    tests.forEach(function(test){
        it(`GET /list/${test.name}`, async function() {

            let response = await request.get(`/list/${test.name}`)
   
            if( response.status >= 400 ){
                assert(test.expect >= 400, "should not give an error code response" )
                return
            }
            assert.equal(test.count, response.body.length)
            response.body.forEach( (section) =>
                assert.equal(test.name, section.subject))
        });
    });
})

describe('GET /checkconflict', function() {
    var tests = [{ name: "attempt 1", one: ["MATH","1000","005"], two: ["HIST", "2600", "001"], result:   "conflict found", status: 200},
                 { name: "attempt 2", one: ["CHEM","1050","001"], two: ["COMP", "1001", "001"], result:"no conflict found", status: 200},
                 { name: "attempt 3", one: ["PHYS","2055","001"], two: ["COMP", "1001", "003"], result:"no conflict found", status: 200},
                 { name: "attempt 4", one: ["GEOG","2302","001"], two: ["GEOG", "1050", "001"], result:   "conflict found", status: 200},
                 { name: "attempt 5", one: ["CRIM","4212","001"], two: ["MATH", "4133", "001"], result:   "conflict found", status: 200},
                 { name: "attempt 6", one: ["EASC","2031","001"], two: ["CRIM", "4212", "001"], result:   "conflict found", status: 200},
                 { name: "attempt 7", one: ["COMP","1001","003"], two: ["SOCI", "6390", "001"], result:"no conflict found", status: 200},
                 { name: "attempt 8", one: ["EASC","6990","001"], two: ["MXAT", "1000", "005"], result:"no conflict found", status: 404},
                 { name: "attempt 9", one: ["GEOG","2425","001"], two: ["FREN", "4900", "001"], result:"no conflict found", status: 200},
                 { name: "attempt10", one: ["COMP","1001","003"], two: [    "", "1000", "005"], result:"no conflict found", status: 404},
                ];

    tests.forEach(function(test){
        it(`GET /checkconflict ${test.name}`, async function() {
            let querya = `subject1=${test.one[0]}&number1=${test.one[1]}&section1=${test.one[2]}`
            let queryb = `subject2=${test.two[0]}&number2=${test.two[1]}&section2=${test.two[2]}`
            let response = await request.get(`/checkconflict?${querya}&${queryb}`)
   
            assert.equal(test.status, response.status )
            if( response.status < 400 ) assert.equal(test.result, response.body)
        });
    });
})
        
