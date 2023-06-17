'use strict';

const { default: mongoose } = require("mongoose");
const { IssueModel } = require("../models/issue");

module.exports = function (app) {

  function createIssueChain() {
    return body('_id')
    .isMongoId()
    .withMessage("Id must be in proper format")
  }

  app.route('/api/issues/:project')

    .get(async function (req, res){
      // filter by req.query. if req.query === null return all.
      const { project } = req.params
      let queryBody = { project }
      const iterableSeries = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open", "_id", "createdAt", "updatedAt"]
      for (let element of iterableSeries) {
        if (element in req.query) {
          queryBody[element] = req.query[element]
        }
      }
      const issues = await IssueModel.find(queryBody)
      res.json(issues)
    })

    .post(async function (req, res){
      const { project } = req.params
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      const requiredFields = ['issue_title', 'issue_text', 'created_by']
      const missingFieldsArr = requiredFields.filter(item => !(item in req.body))
      const missingFields = missingFieldsArr.join(',')
      if (missingFields) {
        return res.send({
          error: 'required field(s) missing'
        })
      }
      const issue = await IssueModel.create({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      })
      res.json(issue.toJSON())
    })

    .put(async function (req, res, next){
      const { project } = req.params
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body
      const update = {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      }
      // no id passed
      if (!_id) {
        return res.json({
          error: "missing _id"
        })
      }
      // validate id format
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({
          error: "could not update",
          _id
        })
      }

      // if no fields sent for update
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        return res.json({
          error: "no update field(s) sent",
          _id
        })
      }

      const [isId, updateRecord] = await Promise.all([
        IssueModel.findById(_id).exec(),
        IssueModel.findByIdAndUpdate({
          _id
        }, update, {upsert: false} )
      ])
      // no record found
      if (!isId) {
        return res.json({
          error: "could not update",
          _id
        })
      }
      res.json({
        result: 'successfully updated',
        _id
      })
    })

    .delete(async function (req, res){
      const { project } = req.params
      const { _id } = req.body

      if (!_id) {
        return res.json({
          error: "missing _id"
        })
      }

      // check for valid id
      const isValidId = mongoose.Types.ObjectId.isValid(_id)
      if(!isValidId) {
        return res.json({
          error: "could not delete",
          _id
        })
      }

      const [recordExists, deleteRecord] = await Promise.all([
        IssueModel.findById(_id).exec(),
        IssueModel.findByIdAndRemove(_id)
      ])
      if (!recordExists) {
        return res.json({
          error: "could not delete",
          _id
        })
      }
      res.json({
        result: "successfully deleted",
        _id
      })
    });

};
