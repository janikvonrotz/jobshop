import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';

export default class CollaborativeEditor extends React.Component {

  insertText(text, selection){
    const editorState = this.state.editorState;
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    if(!selection){selection = selectionState;}
    const cs = Modifier.insertText(contentState, selection, text)
    const es = EditorState.push(editorState, cs, 'insert-fragment');
    this.update(es);
  }

  HandleChange(){
    var {editorState} = this.state;
    var startKey = editorState.getSelection().getStartKey();
    var selectedBlock = editorState
    .getCurrentContent()
    .getBlockForKey(startKey)
  }

  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
  }

  render() {
    const {editorState} = this.state;
    return <Editor editorState={editorState} onChange={this.onChange} />;
  }
}
