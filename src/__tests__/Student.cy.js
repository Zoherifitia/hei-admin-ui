import { mount } from '@cypress/react'
import App from '../App'
import { student1 } from './credentials'
import specTitle from 'cypress-sonarqube-reporter/specTitle'
import { createPaymentMock, feesMock, student1Mock, studentNameToBeCheckedMock, whoamiStudentMock, student1MockWithLocalisation } from './mocks/responses'

describe(specTitle('Student'), () => {
  beforeEach(() => {
    mount(<App />)
    cy.get('#username').type(student1.username)
    cy.get('#password').type(student1.password)
    cy.get('button').contains('Connexion').click()
    cy.intercept('GET', `/students/${student1Mock.id}/fees?page=1&page_size=500`, feesMock).as('getFees')
    cy.intercept('GET', `/students/${student1Mock.id}`, student1Mock).as('getStudent')
    cy.intercept('GET', `/students/${student1Mock.id}/fees/${feesMock[7 - 1].id}/payments?page=1&page_size=10`, createPaymentMock(feesMock[7 - 1])).as(
      'getPaymentsOfFee1'
    )
    cy.intercept('GET', `/students/${student1Mock.id}/fees/${feesMock[0].id}/payments?page=1&page_size=10`, createPaymentMock(feesMock[0])).as(
      'getPaymentsOfFee2'
    )
    cy.intercept('GET', `/students/${student1Mock.id}/fees/${feesMock[7 - 1].id}`, feesMock[7 - 1]).as('getFee1')
    cy.intercept('GET', `/students/${student1Mock.id}/fees/${feesMock[0].id}`, feesMock[0]).as('getFee2')
    cy.intercept('GET', `/whoami`, whoamiStudentMock).as('getWhoami')
  })

  it('lands on profile page if succeeds', () => {
    cy.get('#first_name').contains(studentNameToBeCheckedMock)
  })

  it('can list fees', () => {
    cy.intercept('GET', `/students/${student1Mock.id}/fees?page=1&page_size=500`, feesMock).as('getFees')
    cy.get(`[href="#/students/${student1Mock.id}/fees"]`).click()
    cy.get('body').click(200, 0) //note(uncover-menu)
    cy.contains('200,000 Ar')
  })

  it('can detail fee (click on fee button)', () => {
    cy.get(`[href="#/students/${student1Mock.id}/fees"]`).click()
    cy.get('body')
      .click(200, 0) //note(uncover-menu)
      .wait(['@getStudent', '@getWhoami'])
    cy.get(':nth-child(7) > :nth-child(5)').click()
    cy.contains('En retard')
  })

  it('localisation ok', () => {
    cy.intercept('GET', `/students/${student1Mock.id}`, student1MockWithLocalisation).as('getStudent')
    cy.get('#localisation').contains('latitude : -18.8640332 , longitude : 47.4525344')
  })

  it('localisation is null', () => {
    cy.get('#localisation').contains('latitude: ? , longitude: ?')
  })
})
