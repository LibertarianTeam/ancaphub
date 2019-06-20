import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import DownloadIcon from '@material-ui/icons/CloudDownload'

const useStyles = makeStyles(theme => ({
    media: {
        height: 200,
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
}));

export default function SingleBook(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
      setAnchorEl(event.currentTarget);
    }
  
    function handleClose() {
      setAnchorEl(null);
    }

    const { book } = props;
    return (
        <Grid item xs={3}>
            <Card>
                <CardActionArea>
                    <CardMedia
                        className={classes.media}
                        image={book.cover}
                        title={`Capa do livro ${book.title}`}
                    />
                    <CardContent>
                        <Typography variant="h5" component="h2" noWrap>
                            {book.title}
                        </Typography>
                        <Typography className={classes.pos} variant="subtitle1" gutterBottom>
                            {book.author}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {(book.description.length > 200) ? `${book.description.substring(0, 200)}..` : book.description}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" color="primary">
                        Ver Detalhes
                    </Button>
                    <Button size="small" color="secondary" onClick={handleClick}>
                        Baixar
                        <DownloadIcon className={classes.rightIcon} />
                    </Button>
                    <Menu
                        id={`menubook-${book._id}`}
                        getContentAnchorEl={null}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'center',
                          horizontal: 'center',
                        }}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {book.downloadOptions.map(download => (
                            <MenuItem component="a" href={download.file} target="_blank">{download.type}</MenuItem>
                        ))}
                        
                    </Menu>
                </CardActions>
            </Card>
        </Grid>
    )
}