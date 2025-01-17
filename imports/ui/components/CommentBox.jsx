import React from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import {
  Comment,
  Button,
  TextArea,
  Form,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import FaAngleDown from 'react-icons/lib/fa/angle-down';
import { Tracker } from 'meteor/tracker';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import CommentReply from './CommentReply';

export default class CommentBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      replyVis: false,
      isEditable: false,
      tempComment: '',
    };

    const { comment: { userId } } = this.props;

    Tracker.autorun(() => {
      Meteor.call('getUsername', userId, (err, username) => {
        this.setState({ username });
      });
    });
  }

  componentDidMount() {
    this.setState({

      replyVis: false,
    });
  }

  showReplies() {
    const {
      replies,
      deleteReplyComment,
      editReplyComment,
      isMember,
      index,
    } = this.props;
    if (replies) {
      return (replies.map((reply, i) => (
        <CommentReply
          key={reply.time}
          subIndex={i}
          reply={reply}
          deleteReplyComment={deleteReplyComment}
          editReplyComment={editReplyComment}
          isMember={isMember}
          index={index}
        />
      )));
    }
  }

  findTime() {
    const { comment: { time } } = this.props;
    return moment(time);
  }

  showDownArrow() {
    const { replyVis, isEditable } = this.state;
    const { replies } = this.props;
    if (replyVis === false) {
      if (!Meteor.userId()) {
        if (replies.length === 0) {
          return null;
        }

        return (

          <FaAngleDown
            className="arrow"
            size={17}
            onClick={() => {
              this.setState(prev => ({

                replyVis: !prev.replyVis,
              }));
            }}
          >
            Show
          </FaAngleDown>
        );
      }
      if (isEditable === false) {
        return (
          <a
            className="arrow"
            style={{ marginRight: '1.2rem' }}
            size={17}
            onClick={() => {
              this.setState(prev => ({

                replyVis: !prev.replyVis,
              }));
            }}
          >
            Replies
          </a>
        );
      }
    }
  }

  render() {
    const {
      isMember,
      comment: { userId },
      deleteComment,
      index,
      comment: { comment },
      editComment,
      slides,
      curSlide,
      saveChanges,
    } = this.props;
    const {
      username,
      isEditable,
      tempComment,
      replyVis,
    } = this.state;
    const isOwner = Meteor.userId() === userId && isMember;
    return (
      <div>
        <Comment style={{
          padding: '0.8rem', marginBottom: '0.8rem', marginTop: '0.8rem', backgroundColor: '#eeeeee',
        }}
        >
          <Comment.Content style={{ width: '100%' }}>
            {/* <Comment.Avatar src='/images/avatar/small/matt.jpg' /> */}
            {isOwner ? (
              <Button
                style={{ float: 'right', padding: '0.5rem' }}
                onClick={() => {
                  const confirmation = confirm('Are you sure you want to delete your comment?');
                  if (confirmation === true) { deleteComment(index); }
                }
                }
              >
                X
              </Button>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Comment.Author>{username}</Comment.Author>
              <Comment.Metadata style={{ paddingLeft: '0.8rem', paddingTop: '0.15rem' }}>
                <div>{this.findTime().fromNow()}</div>
              </Comment.Metadata>
            </div>

            {!isEditable ? <Comment.Text style={{ padding: '0.8rem 0', width: '95%' }}>{comment}</Comment.Text> : null}
            {isEditable ? (
              <Form style={{ margin: '1.2rem 0' }}>
                <TextArea
                  onChange={(e, d) => {
                    this.setState({
                      tempComment: d.value,
                    });
                  }}
                  value={tempComment}
                />
              </Form>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {this.showDownArrow()}

              {replyVis ? (
                <a
                  className="arrow"
                  style={{ marginRight: '1.2rem' }}
                  size={17}
                  onClick={() => {
                    this.setState(prev => ({
                      replyVis: !prev.replyVis,
                    }));
                  }}
                >
                  Hide
                </a>
              ) : null}

              { isOwner ? (
                <a
                  onClick={() => {
                    if (isEditable === false) {
                      this.setState({
                        isEditable: true,
                        tempComment: comment,
                      });
                    } else {
                      this.setState({
                        isEditable: false,
                      }, () => {
                        editComment(tempComment, index);
                      });
                    }
                  }}
                  className="arrow"
                >
                  {isEditable ? 'Save' : 'Edit'}
                </a>
              ) : null}
              {isEditable ? <a style={{ marginLeft: '1.2rem' }} size={17} className="arrow" onClick={() => { this.setState({ isEditable: false }); }}>Cancel</a> : null}
            </div>
          </Comment.Content>
        </Comment>
        {replyVis ? (
          <div>
            <div>{this.showReplies()}</div>
            {Meteor.userId() && isMember
              ? (
                <div>
                  <CommentForm
                    option={index}
                    slides={slides}
                    curSlide={curSlide}
                    saveChanges={saveChanges}
                  />
                </div>
              ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

CommentBox.propTypes = {
  isMember: PropTypes.bool.isRequired,
  comment: PropTypes.shape({
    comment: PropTypes.string,
    userId: PropTypes.string,
    time: PropTypes.number,
    replies: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  editComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  replies: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteReplyComment: PropTypes.func.isRequired,
  editReplyComment: PropTypes.func.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  curSlide: PropTypes.number.isRequired,
  saveChanges: PropTypes.func.isRequired,
};
