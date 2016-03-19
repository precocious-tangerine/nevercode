export const editor = () => {
  return {
    url: '/editor',
    restrict: 'E',
    controllerAs: 'editor',
    controller: EditorCtrl,
    template: require('./editor.html'),
    scope: {},
    access: { restricted: true }
  }
}

class EditorCtrl {
  constructor($ngRedux, Snippets) {
    $ngRedux.connect(this.mapStateToThis)(this);
    this.Snippets = Snippets;
    this.editorOptions = {
      lineNumbers: true,
      indentWithTabs: true,
      theme: 'eclipse',
      lineWrapping: true,
      mode: 'javascript'
    };
    this.tag = '';
    this.tagToRemove = '';
    this.addTag = false;
    this.showAnnotation = false;
  }

  toggleTag() {
    this.addTag = !this.addTag;
  }

  toggleAnnotation() {
    this.showAnnotation = !this.showAnnotation;
  }

  removeTag(tag) {
    this.tagToRemove = tag;
    this.addOrUpdateSnippet();
    this.tagToRemove = '';
  }

  addOrUpdateSnippet() {
    if (this.selectedSnippet) {
      let objectToUpdate = Object.assign({}, this.snippetMap[this.selectedSnippet].value);
      let _id = objectToUpdate._id;
      let tags = objectToUpdate.tags;
      if(this.tag) {
        tags.push(this.tag);
      };
      if(this.tagToRemove) {
        tags.splice(tags.indexOf(this.tagToRemove), 1);
      };
      objectToUpdate.filePath = this.snippetMap[this.selectedSnippet].parent + '/' + this.snippetObj.name;
      Object.assign(objectToUpdate, { data: this.snippetObj.data, name: this.snippetObj.name });
      delete objectToUpdate._id;
      this.Snippets.updateSnippet({ snippetId: _id, value: objectToUpdate });
    } else {
      this.snippetObj.filePath = this.path + '/' + this.snippetObj.name;
      this.Snippets.addSnippet(this.snippetObj);
    }
    this.tag = '';
    this.toggleTag();
  }

  mapStateToThis(state) {
    let { selectedFolder, selectedSnippet, snippetMap } = state;
    let path = !selectedFolder ? null : snippetMap[selectedFolder].filePath;
    let buttonText = selectedSnippet ? 'Update Snippet' : 'Add Snippet';
    let snippetObj = {};
    snippetObj.data = !selectedSnippet ? ' ' : snippetMap[selectedSnippet].value.data;
    snippetObj.name = selectedSnippet ? snippetMap[selectedSnippet].value.name : '';
    return {
      path,
      snippetMap,
      selectedSnippet,
      buttonText,
      snippetObj
    };
  }
}
