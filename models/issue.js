'use strict'

const { default: mongoose } = require("mongoose")

const IssueSchema = new mongoose.Schema({
  project: {
    type: String,
    required: true,
    index: true
  },
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
    default: ""
  },
  status_text: {
    type: String,
    default: ""
  },
  open: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

IssueSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v
    ret = null
    return
  }
})

const IssueModel = mongoose.model('Issue', IssueSchema)

exports.IssueModel = IssueModel
