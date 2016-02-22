package com.sentrana.biq.core.physical.Sql.MySQL

import com.sentrana.biq.core.physical.{ StatementPart, SqlStatementBuilder }
import com.sentrana.biq.core.physical.StatementPart.Implicits._

/**
 * Created by williamhogben on 7/16/15.
 */
case class MySqlStatementBuilder(
    selectStatements:      Traversable[StatementPart],
    fromStatements:        Traversable[StatementPart],
    whereStatements:       Traversable[StatementPart],
    groupByStatements:     Traversable[StatementPart],
    orderByStatements:     Traversable[StatementPart],
    override val totalsOn: Boolean                    = false
) extends SqlStatementBuilder {

  override def groupByWithRollup = s"GROUP BY$lineTerminator" +/ indent(groupByStatements)

}
