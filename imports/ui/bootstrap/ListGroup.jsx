import React from 'react';

export default class ListGroup extends React.Component {

  /*
  ListGroup: {
    iconClassName,
    linked,
    draggable,
    items: {
      key, label, href, labelPill
    }
  }
  onDrop(sourceId, trargetId)
  */

  isbefore(a, b) {
    if (a.parentNode == b.parentNode) {
        for (var cur = a; cur; cur = cur.previousSibling) {
            if (cur === b) {
                return true;
            }
        }
    }
    return false;
  }

  handleDragStart(id, event) {
    // this.dragged = event.target.parentNode;
    this.sourceId = id;
    this.source = event.target;
    // event.target.style.opacity = '0.4';
  }

  handleDragEnter(id, event){
    // event.target.classList.add("dnd-target");
    // this.over = event.target.parentNode;
    if(id != this.sourceId){
      this.targetId = id;
    }
    // console.log(id)
    if (this.isbefore(this.source, event.target)) {
        event.target.parentNode.insertBefore(this.source, event.target);
    }
    else {
        event.target.parentNode.insertBefore(this.source, event.target.nextSibling);
    }
  }

  handleDragOver(event) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    event.dataTransfer.dropEffect = 'move';
  }

  handleDragLeave(event){
    // event.target.parentNode.style.backgroundColor = '';
    // this.targetId = undefined;
  }

  handleDrop(event) {
    // if(typeof this.targetId != 'undefined'){
      // this.props.update_parent(this.sourceId, this.targetId);
    // }
    this.props.onDrop(this.sourceId, this.targetId );
  }

  handleDragEnd(event) {
    // this.dragged.style.opacity = '';
    // if(typeof this.over != 'undefined'){
    //   this.over.style.backgroundColor = '';
    // }
  }

  renderItemLabelPill(item){
    if(item.labelPill){
      return (<span className="label label-default label-pill pull-xs-right">{item.labelPill}</span>)
    }
  }

  renderItemLabel(item){
    if(this.props.iconClassName){
      return (
        <span><i className={this.props.iconClassName}></i> {item.label}</span>
      );
    }else{
      return (item.label)
    }
  }

  renderListGroup() {
    if ( this.props.linked ) {
      return (
        <div className="list-group">
          {this.props.items.map( ( item ) => {
            return (
              <a
              draggable={this.props.draggable}
              onDragStart={this.handleDragStart.bind(this, item.key)}
              onDragEnter={this.handleDragEnter.bind(this, item.key)}
              onDragOver={this.handleDragOver.bind(this)}
              onDragLeave={this.handleDragLeave.bind(this)}
              onDrop={this.handleDrop.bind(this)}
              onDragEnd={this.handleDragEnd.bind(this)}

              key={ item.key }
              href={ item.href }
              className={"list-group-item"}>
              {this.renderItemLabelPill}
              {this.renderItemLabel(item)}
              </a>
            );
          })}
        </div>
      );
    } else {
      return (
        <ul className="list-group">
          {this.props.items.map( ( item ) => {
            return (
              <li
              draggable={this.props.draggable}
              onDragStart={this.handleDragStart.bind(this, item.key)}
              onDragEnter={this.handleDragEnter.bind(this, item.key)}
              onDragOver={this.handleDragOver.bind(this)}
              onDragLeave={this.handleDragLeave.bind(this)}
              onDrop={this.handleDrop.bind(this)}
              onDragEnd={this.handleDragEnd.bind(this)}

              key={ item.key }
              className={"list-group-item"}>
              {this.renderItemLabelPill(item)}
              {this.renderItemLabel(item)}
              </li>
            );
          })}
        </ul>
      );
    }
  }

  render() {
    return this.renderListGroup();
  }
}
