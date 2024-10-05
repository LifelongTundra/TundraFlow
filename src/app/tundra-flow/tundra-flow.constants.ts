export const startNodeHtml = `
    <div>
        <div class="title-box">
            <i class="fa fa-play"></i> 
            Start Node 
        </div>
    </div>
`

export const endNodeHtml = `
    <div>
        <div class="title-box">
            <i class="fa fa-stop"></i> 
            End Node
        </div>
    </div>
`

export const decisionNodeHtml = `
    <div>
        <div class="title-box">
            <i class="fas fa-code"></i> 
            Decision Node
        </div>
        <div class="box">
            Type in your decision request
            <textarea df-template></textarea>
            *note area to explain whats going on?*
        </div>
    </div>
`

export const multiNodeHtml = `
    <div>
        <div class="box">
            Multiple!
        </div>
    </div>
`

export const defaultEmptyData = {
    "drawflow": {
        "Home": {
            "data": {

            }
        }
    }
}
