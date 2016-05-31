import React, {Component} from 'react';
import {Badge,Button, ButtonGroup, ButtonToolbar, Glyphicon} from 'react-bootstrap';
import ScifiStore from './stores/ScifiStore';
import ScifiQueryButton from './ScifiQueryButton';
import ScifiLinkButton from './ScifiLinkButton';
import ElementStore from 'components/stores/ElementStore';


import SVG from 'react-inlinesvg';
import classnames from 'classnames';

export default class ReactionDetailsTabHook extends Component {

  constructor(props) {
    super(props);
    //const {reaction} = props.reaction;
    let selection = {};
    [
      ...this.props.reaction._starting_materials.map((e)=>{return e.type+e.id;}),
      ...this.props.reaction._reactants.map((e)=>{return e.type+e.id;}),
      ...this.props.reaction._products.map((e)=>{return e.type+e.id;}),
    ].map((e)=>{ selection[e]=true;});
    this.state = {
      ...ScifiStore.getState(),
      ...selection,
    };
     //

  }

  componentDidMount() {
  //  ElementStore.listen(this.onChange.bind(this));
    ScifiStore.listen(this.onChange.bind(this));
  }

  componentWillUnmount() {
  //  ElementStore.unlisten(this.onChange.bind(this));
    ScifiStore.unlisten(this.onChange.bind(this));
  }

  onChange(state) {
    let selection = {};
    [
      ...this.props.reaction._starting_materials.map((e)=>{return e.type+e.id;}),
      ...this.props.reaction._reactants.map((e)=>{return e.type+e.id;}),
      ...this.props.reaction._products.map((e)=>{return e.type+e.id;}),
    ].map((e)=>{ selection[e]=true;});
    this.setState({...state});//,...selection,    };
    //({...this.state} = {...ScifiStore.getState()});
  }



  buildRxn(){
    //todo move rxn file build  to backend?
    let rxn = "$RXN\n\n\n\n";
    let molBreak = "$MOL\n";
    let rl = 0;
    let xl = 0;
    let pl = 0;
    let molfiles="";
    let svgs ={reagents:[],products:[]};
    this.props.reaction._starting_materials.map((e)=>{
      if (this.state[e.type+e.id]){ ++rl; molfiles +=  molBreak+e.molfile;
        svgs.reagents.push(e.molecule.molecule_svg_file);
      }
    });
    this.props.reaction._reactants.map((e)=>{
      if (this.state[e.type+e.id]){ ++xl; molfiles +=  molBreak+e.molfile;svgs.reagents.push(e.molecule.molecule_svg_file);}
    });
    this.props.reaction._products.map((e)=>{
      if (this.state[e.type+e.id]){ ++pl; molfiles +=  molBreak+e.molfile;svgs.products.push(e.molecule.molecule_svg_file);}
    });

    rxn += ("   " + (rl+xl).toString()).slice( -3);
    rxn += ("   " + pl.toString()).slice( -3);
//  rxn += ("   " + 0).slice( -3);
    rxn += "\n"
    rxn += molfiles;

    return {rxn: rxn, svgs: svgs};
  }

  moleculeSelector(){

    let reagents  = this.props.reaction._starting_materials//.map((e)=>e._molecule.molecule_svg_file) ||[];
    let reactants = this.props.reaction._reactants//.map((e)=>e._molecule.molecule_svg_file) || [];
    let products  = this.props.reaction._products//.map((e)=>e._molecule.molecule_svg_file) || [];

    return  (
      <ButtonToolbar><ButtonGroup justified>

          {reagents.map((e,i)=>{return this.buttonSVG(`/images/molecules/${e._molecule.molecule_svg_file}`,e.type+e.id);})}
          {reactants.map((e,i)=>{return this.buttonSVG(`/images/molecules/${e._molecule.molecule_svg_file}`,e.type+e.id);})}
            <ButtonGroup>  <Button><Glyphicon glyph="arrow-right" /></Button>  </ButtonGroup>
          {products.map((e,i)=>{return this.buttonSVG(`/images/molecules/${e._molecule.molecule_svg_file}`,(e.type+e.id));})}

      </ButtonGroup></ButtonToolbar>
    )
  }

  buttonSVG(svgPath,id){
      let classes = classnames({
          'btn-info': true,
        //  'btn-primary': !this.state[id],
        //  'btn-default': this.state[id],
          disabled: !this.state[id]
      });

    return(
      <ButtonGroup  key={"btGrp"+id} >
        <Button className={classes} style={{ cursor:'pointer'}} onClick={() =>{this.toggleSelection(id)}}>
          <SVG key={id} uniquifyIDs={true} style={{ verticalAlign: 'middle'}} className={'molecule'}    src={svgPath}/>
        </Button>
      </ButtonGroup>
    )
  }

  toggleSelection(id){
    let newState = {};
    if (this.state[id]) {
      newState[id]=false;
      this.setState(newState);
    } else {
      newState[id]=true;
      this.setState(newState);
    }
  }

  render() {
    let reaction = this.props.reaction;
    let links = this.state.links;
    let lastLink = this.state.lastLink;
    if ( lastLink.elementId != this.props.reaction.id){  lastLink= {};}
    let rxn = this.buildRxn();

    return (
      <div style={{width:100+'%'}}>
        <br/>
        <ButtonToolbar><ButtonGroup justified>
          <ButtonGroup><ScifiQueryButton  element={reaction} params={{...rxn , searchType : 'variable'}}       /> </ButtonGroup>
          <ButtonGroup><ScifiQueryButton  element={reaction} params={{...rxn, searchType : 'substructure'}}/> </ButtonGroup>
        </ButtonGroup></ButtonToolbar>
        {this.moleculeSelector()}
        <ScifiLinkButton linkElement={lastLink}/>
        <br/>
        <h5>Search History</h5>
          {links.map((l)=><ScifiLinkButton linkElement={l} key={l.key}/>) }
      </div>
    )
  }

}
