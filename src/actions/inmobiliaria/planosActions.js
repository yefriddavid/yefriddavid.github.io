import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch inmobiliaria planos')
export const beginRequestFetch = createAction('begin fetch inmobiliaria planos')
export const successRequestFetch = createAction('success fetch inmobiliaria planos')
export const errorRequestFetch = createAction('error fetch inmobiliaria planos')

export const loadRequest = createAction('load inmobiliaria plano')
export const beginRequestLoad = createAction('begin load inmobiliaria plano')
export const successRequestLoad = createAction('success load inmobiliaria plano')
export const errorRequestLoad = createAction('error load inmobiliaria plano')

export const createRequest = createAction('create inmobiliaria plano')
export const beginRequestCreate = createAction('begin create inmobiliaria plano')
export const successRequestCreate = createAction('success create inmobiliaria plano')
export const errorRequestCreate = createAction('error create inmobiliaria plano')

export const updateRequest = createAction('update inmobiliaria plano')
export const beginRequestUpdate = createAction('begin update inmobiliaria plano')
export const successRequestUpdate = createAction('success update inmobiliaria plano')
export const errorRequestUpdate = createAction('error update inmobiliaria plano')

export const deleteRequest = createAction('delete inmobiliaria plano')
export const beginRequestDelete = createAction('begin delete inmobiliaria plano')
export const successRequestDelete = createAction('success delete inmobiliaria plano')
export const errorRequestDelete = createAction('error delete inmobiliaria plano')

export const clearPlano = createAction('clear inmobiliaria plano')

export const cloneRequest = createAction('clone inmobiliaria plano')
export const beginRequestClone = createAction('begin clone inmobiliaria plano')
export const successRequestClone = createAction('success clone inmobiliaria plano')
export const errorRequestClone = createAction('error clone inmobiliaria plano')
