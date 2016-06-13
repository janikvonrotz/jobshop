import React from 'react';

export default class ListGroup extends React.Component {

  // ListGroup:{ iconClassName, linked, draggable, items: {key, label, href, labelPill, position} }
  // onDrop(item, oldPosition, newPosition)

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
      return item.label
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
